const fs = require("node:fs");
const path = require("node:path");

function ScramJetBuilt() {
    return fs.existsSync(path.join(process.cwd(), "ScramJet")) &&
           fs.existsSync(path.join(process.cwd(), "ScramJet", "RevisionCache.json")) &&
           JSON.parse(fs.readFileSync(path.join(process.cwd(), "ScramJet", "RevisionCache.json"))).installed !== -1
}

function copyFile(source, destination) {
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(source, destination);
}

function ensureRuntimeDependencies(packageJsonPath) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
    const dependencies = {
        "@nebula-services/bare-server-node": "^2.0.4",
        "@fastify/static": "^10.1.6",
        "@mercuryworkshop/libcurl-transport": "2.0.5",
        fastify: "^5.12.7",
    };
    let changed = false;

    packageJson.dependencies ??= {};
    for (const [name, version] of Object.entries(dependencies)) {
        if (!packageJson.dependencies[name]) {
            packageJson.dependencies[name] = version;
            changed = true;
        }
    }

    if (changed) {
        fs.writeFileSync(packageJsonPath, `${JSON.stringify(packageJson, null, "\t")}\n`);
    }
}

if (ScramJetBuilt()) {
    console.log("Overriding ScramJet files ...");
    try {
        const root = process.cwd();
        const cloneRoot = path.join(root, "source", "clones");
        const scramjetRoot = path.join(root, "ScramJet");

        ensureRuntimeDependencies(path.join(scramjetRoot, "package.json"));
        copyFile(path.join(cloneRoot, "server.js"), path.join(scramjetRoot, "server.js"));
        copyFile(path.join(cloneRoot, "static", "ui.js"), path.join(scramjetRoot, "static", "ui.js"));
        copyFile(path.join(cloneRoot, "static", "index.html"), path.join(scramjetRoot, "static", "index.html"));
        copyFile(path.join(cloneRoot, "static", "store.js"), path.join(scramjetRoot, "static", "store.js"));
        copyFile(path.join(cloneRoot, "static", "sw.js"), path.join(scramjetRoot, "static", "sw.js"));
    
        console.log("Successfully replaced original ScramJet files!");
    } catch (error) {
        console.log(`Failed to replace ScramJet files :( (${error})`);
    }
} else {
    console.log("ScramJet hasn't been built yet. Initiate a build using: bash scripts/init.sh");
}