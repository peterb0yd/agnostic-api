const fs = require('fs');
const {spawnSync} = require('child_process');
let child;
let hasChanges;

const getOutput = ({output})=> output.join('').toString().replace(/\s/, '');
const printOutput = (data, appendMsg = '')=> console.log(getOutput(data), ` ${appendMsg}`);

function rebuildDockerContainer () {
    child = spawnSync('sudo', ['docker', 'ps', '-a', '--format', '{{.Names}}']); 
    if (child.output[1].toString().split('\n').includes('agnostic-api')) {
        child = spawnSync('sudo', ['docker', 'container', 'stop', 'agnostic-api']);
        printOutput(child, 'stopped.');
        child = spawnSync('sudo', ['docker', 'container', 'rm', 'agnostic-api']);
        printOutput(child, 'removed.');
    }
    console.log('...building...');
    child = spawnSync('sudo', ['docker', 'build', '-t', 'toprocklabs/agnostic-api', '.']);
    console.log('done building.');
    child = spawnSync('sudo', ['docker', 'run', '-p', '3000:3000', '-d', '--name', 'agnostic-api', 'toprocklabs/agnostic-api']);
    const containerId = getOutput(child);
    console.log({containerId});
    console.log('\nRun "sudo docker logs -f <container-id>" in a separate window to view output\n');
}

function doRebuild () {
    if (!hasChanges) return;
    hasChanges = false;
    rebuildDockerContainer();
}
async function watchHandler (event, filename) {
    if (hasChanges) return;
    console.log();
    console.log(event, filename);
    hasChanges = true;
    setTimeout(doRebuild.bind(this), 200);
}

function resync () {
    fs.watch('./src/', {persistent: true}, watchHandler);
    fs.watch('./src/routes', {persistent: true}, watchHandler);
    fs.watch('./src/config', {persistent: true}, watchHandler);
    fs.watch('./src/mailers', {persistent: true}, watchHandler);
    fs.watch('./src/lib', {persistent: true}, watchHandler);
    fs.watch('./src/lib/utils', {persistent: true}, watchHandler);
    fs.watch('./src/lib/verifiers', {persistent: true}, watchHandler);
    fs.watch('./src/lib/generators', {persistent: true}, watchHandler);
}

rebuildDockerContainer();
resync();