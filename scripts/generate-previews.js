// Generate previews of all exported artworks and write them to public/generated/{name}.svg
const path = require("path");
const childProcess = require("child_process");
const fs = require("fs");
const axios = require("axios");
const treeKill = require("tree-kill");
const svgToImage = require("node-svg2img");

const ROOT_PATH = path.resolve(__dirname, "..");
const PUBLIC_PATH = path.resolve(ROOT_PATH, "./public/generated");

async function main() {
  // Run next dev
  const nextProcess = childProcess.spawn("npm run dev", {
    cwd: ROOT_PATH,
    shell: true,
    stdio: ["inherit", "inherit", "inherit"],
  });

  const client = axios.default.create({
    baseURL: "http://localhost:3000",
  });
  // Wait for server to be ready
  await client.get("/");

  // Fetch the gallery index
  const index = await client.get("/api/gallery");

  for (let slug of index.data) {
    // const svgOutput = path.resolve(PUBLIC_PATH, slug + ".svg");
    const pngOutput = path.resolve(PUBLIC_PATH, slug + ".png");
    const svgPayload = await client.get("/api/render/" + slug, { responseType: "text" });

    const dirName = path.dirname(pngOutput);
    fs.mkdirSync(dirName, { recursive: true });

    // fs.writeFileSync(svgOutput, svgPayload.data, { encoding: "utf-8" });
    // console.log(`Wrote ${slug} to ${svgOutput} (${svgPayload.data.length})`);

    await new Promise((resolve, reject) =>
      svgToImage(svgPayload.data, { width: 800, height: 600 }, (error, buffer) => {
        if (error) {
          return reject(error);
        }

        fs.writeFileSync(pngOutput, buffer);
        console.log(`Wrote ${slug} to ${pngOutput} (${buffer.length})`);
        resolve();
      })
    );
  }

  await new Promise((resolve, reject) => treeKill(nextProcess.pid, (err) => (err ? reject(err) : resolve())));
}

main()
  .then(() => {
    console.log("done");
  })
  .catch((e) => {
    console.error(e);
    process.exit(-1);
  });
