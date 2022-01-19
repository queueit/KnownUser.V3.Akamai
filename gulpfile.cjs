const { src, dest } = require("gulp");
const tar = require('gulp-tar');
const gzip = require('gulp-gzip');
const modifyFile = require('gulp-modify-file');
const jsonModify = require('gulp-json-modify')
const path = require('path')

function addKnownUserExports(content) {
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

function addQueueTokenExports(content) {
    content = "var exportObject = {};\n" + content;
    content += `
var Token = exportObject.Token;
var Payload = exportObject.Payload;
export { Payload, Token };`;
    const tokenPropertyDefinition = content.indexOf('Object.defineProperty(exports, "Token"');
    const newLine = content.indexOf('},', tokenPropertyDefinition);
    const firstPart = content.substring(0, newLine - 2);
    const secondPart = content.substring(newLine - 1);
    return firstPart + `
        exportObject.Payload = Payload_1.Payload;
        exportObject.Token = Token_1.Token;
    ` + secondPart;
}

exports.packageArtifacts = () => {
    return src([
        'bundle.json',
        'dist/*.js',
        'dist/**/*.js'
    ])
        .pipe(modifyFile((content, filePath, _) => {
            let filename = path.basename(filePath);
            if (filename === 'queueit-knownuserv3-sdk.js') {
                content = addKnownUserExports(content);
            }
            if (filename === 'queueToken.js') {
                content = addQueueTokenExports(content);
            }
            return content;
        }))
        .pipe(tar('kuedge.tar'))
        .pipe(gzip())
        .pipe(dest('dist'));
}

exports.prepare = () => {
    return src([
        'sdk/*.js'
    ])
        .pipe(modifyFile((content, filePath, _) => {
            let filename = path.basename(filePath);
            if (filename === 'queueit-knownuserv3-sdk.js') {
                content = addKnownUserExports(content);
            }
            if (filename === 'queueToken.js') {
                content = addQueueTokenExports(content);
            }
            return content;
        }))
        .pipe(dest('dist/sdk'));
}

exports.stripPackage = () => {
    return src(['./package.json'])
        .pipe(jsonModify({ key: 'devDependencies', value: {} }))
        .pipe(jsonModify({ key: 'scripts', value: {} }))
        .pipe(dest('./'))
}

exports.packageForDeployment = () => {
    return src([
        'bundle.json',
        'edgegrid.edgerc',
        'dist/*.js',
        'dist/**/*.js'
    ])
        .pipe(modifyFile((content, filePath, _) => {
            let filename = path.basename(filePath);
            if (filename === 'queueit-knownuserv3-sdk.js') {
                content = addKnownUserExports(content);
            }
            if (filename === 'queueToken.js') {
                content = addQueueTokenExports(content);
            }
            return content;
        }))
        .pipe(tar('kuedge.deployment.tar'))
        .pipe(gzip())
        .pipe(dest('dist'));
}
