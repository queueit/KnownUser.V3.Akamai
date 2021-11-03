const {src, dest} = require("gulp");
const tar = require('gulp-tar');
const gzip = require('gulp-gzip');
const modifyFile = require('gulp-modify-file');
const path = require('path')

function addExports(content) {
    content = "var exportObject = {};\n" + content;
    content += `
var Utils = exportObject.Utils;
var KnownUser = exportObject.KnownUser;
export { KnownUser, Utils };`;
    const lastPropertyDefinition = content.lastIndexOf('Object.defineProperty(');
    const newLine = content.indexOf('\n', lastPropertyDefinition);
    const firstPart = content.substring(0, newLine);
    const secondPart = content.substring(newLine + 1);
    return firstPart + `
        exportObject.KnownUser = KnownUser_1.KnownUser;
        exportObject.Utils = QueueITHelpers_1.Utils;
    ` + secondPart;
}

exports.packageArtifacts = () => {
    return src([
        'bundle.json',
        'outDir/*.js',
        'outDir/**/*.js'
    ])
        .pipe(modifyFile((content, filePath, _) => {
            let filename = path.basename(filePath);
            if (filename !== 'queueit-knownuserv3-sdk.js') {
                return content;
            }
            content = addExports(content);
            return content;
        }))
        .pipe(tar('kuedge.tar'))
        .pipe(gzip())
        .pipe(dest('dist'));
}

exports.prepare = ()=>{
    return src([
        'sdk/*.js'
    ])
        .pipe(modifyFile((content, filePath, _) => {
            let filename = path.basename(filePath);
            if (filename !== 'queueit-knownuserv3-sdk.js') {
                return content;
            }
            content = addExports(content);
            return content;
        }))
        .pipe(dest('outDir/sdk'));
}

exports.packageForDeployment = () => {
    return src([
        'bundle.json',
        'edgegrid.edgerc',
        'outDir/*.js',
        'outDir/**/*.js'
    ])
        .pipe(modifyFile((content, filePath, _) => {
            let filename = path.basename(filePath);
            if (filename !== 'queueit-knownuserv3-sdk.js') {
                return content;
            }
            content = addExports(content);
            return content;
        }))
        .pipe(tar('kuedge.deployment.tar'))
        .pipe(gzip())
        .pipe(dest('dist'));
}
