const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// 설정
const sharedFiles = ["src", "README.md", "scripts"];
const releaseLog = "release-log.md";
const now = new Date();
const releaseDate = now.toISOString().slice(0, 10);

function run(cmd) {
  console.log(`🔧 ${cmd}`);
  return execSync(cmd);
}

function getLatestDevHash() {
  return execSync("git rev-parse --short dev").toString().trim();
}

function appendToReleaseLog(commitHash) {
  const logHeader =
    "| 버전 | 기준 커밋 (dev) | 반영 일자 | 설명 |\n" +
    "|------|-----------------|-----------|------|\n";

  const logLine = `|      | ${commitHash} | ${releaseDate} | 공유 디렉토리 반영 |\n`;

  if (!fs.existsSync(releaseLog)) {
    fs.writeFileSync(releaseLog, logHeader + logLine);
  } else {
    fs.appendFileSync(releaseLog, logLine);
  }
}

function main() {
  const latestHash = getLatestDevHash();

  // dev → 최신
  run("git checkout dev");
  run("git pull origin dev");

  // main → 최신
  run("git checkout main");
  run("git pull origin main");

  // 공유 파일만 가져오기
  sharedFiles.forEach((file) => {
    run(`git checkout dev -- ${file}`);
  });

  // release-log.md 업데이트
  appendToReleaseLog(latestHash);

  // 커밋 및 푸시
  run(`git add ${sharedFiles.join(" ")} ${releaseLog}`);
  run(`git commit -m "release: 공유 디렉토리 반영 from dev @ ${latestHash}"`);
  run("git push origin main");

  console.log("\n✅ 공유 디렉토리가 main 브랜치에 반영되었습니다.");
}

main();
