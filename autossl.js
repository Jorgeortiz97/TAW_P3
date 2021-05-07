const { execSync } = require('child_process');
const readline = require("readline");

const EXT_FILE_HEADER = 'authorityKeyIdentifier=keyid,issuer\n\
basicConstraints=CA:FALSE\n\
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment\n\
subjectAltName = @alt_names\n\
[alt_names]\n';

const HELP_MSG = [
    "Set the common name (example: 'taw.um.es')",
    "Add alternative names (example: 'localhost, mydomain.com')",
    "Add alternative IP addresses (example: '127.0.0.1, 192.168.100.50')",
    "Type 'generate' to generate credentials or 'show' to display information"
];

var step = 0;
function show_help() {
    console.log(`\n${HELP_MSG[step]} (step ${step} / ${HELP_MSG.length})\n`);
    rl.prompt();
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: 'autossl> ',
    completer: (line) => {
        show_help();
        return [line];
    }
});


console.log('Welcome to AutoSSL tool!\n',
            'Please, follow the steps to generate the credentials.\n',
            'You can use the following keyy bindings:\n',
            ' - TAB: show information\n',
            ' - Ctrl+C / Ctrl+D: quit\n',
            ' - Ctrl+Z: undo previous command\n');

show_help();

rl.on('SIGTSTP', () => {
    if (step > 0) {
        console.log('Undoing last command');
        step--;
    }
    show_help();
}).on('close', () => {
    console.log('Credentials were not generated...');
    process.exit(0);
}).on('line', (line) => {
    switch (step) {
        case 0:
            commonName = (line.length ? line.trim() : "taw.um.es");
            break;
        case 1:
            altNames = (line.length ? line.split(',') : ["localhost"]);
            break;
        case 2:
            altIPs = (line.length ? line.split(',') : ["127.0.0.1"]);
            break;
        case 3:
            if (line.trim() == 'generate') {
                try {
                    // Remove credentials folder
                    execSync('rm -rf credentials');

                    // Create credentials folder
                    execSync('mkdir credentials');

                    // Generate a random passphrase
                    execSync('openssl rand -out credentials/passphrase.txt -hex 256 2> /dev/null');

                    // Generate CA private key
                    execSync('openssl genrsa -des3 -passout file:credentials/passphrase.txt \
                            -out credentials/CAKey.pem 2048 2> /dev/null')

                    // Generate CA root certificate
                    execSync(`openssl req -x509 -new -nodes -passin file:credentials/passphrase.txt \
                            -key credentials/CAKey.pem -sha256 -days 36500 -out credentials/CACert.pem \
                            -subj "/C=ES/O=UM/CN=${commonName}" 2> /dev/null`);

                    // Generate CSR
                    execSync(`openssl req -new -passin file:credentials/passphrase.txt \
                            -key credentials/CAKey.pem -out credentials/req.csr -subj "/C=ES/O=UM/CN=${commonName}" 2> /dev/null`);

                    // Generate private key
                    execSync('openssl rsa -in credentials/CAKey.pem -passin file:credentials/passphrase.txt \
                            -out credentials/key.pem 2> /dev/null');

                    // Generate a self-signed certificate
                    let extFile = EXT_FILE_HEADER;

                    if (altNames.length || altIPs.length) {
                        for (i = 0; i < altNames.length; i++)
                            extFile += `DNS.${i + 1} = ${altNames[i]}\n`;
                        for (i = 0; i < altIPs.length; i++)
                            extFile += `IP.${i + 1} = ${altIPs[i]}\n`;
                    }

                    execSync(`echo "${extFile}" > credentials/ext.conf`);

                    execSync(`openssl x509 -req -days 36500 -in credentials/req.csr \
                            -signkey credentials/key.pem -out credentials/cert.pem \
                            -extfile credentials/ext.conf 2> /dev/null`);

                    console.log('Credentials were successfully generated!');

                } catch (error) {
                    console.error(`An error occurred: ${error.message}`);
                }
                process.exit(0);
            } else if (line.trim() == 'show') {
                console.log(`Common Name: ${commonName}`);
                console.log(`Alternative Names: ${altNames}`);
                console.log(`Alternative IPs: ${altIPs}`);
            } else
                console.log(`Unrecognized command '${line.trim()}'`);
        default:
            break;
    }
    if (step < 3)
        step++;
    show_help();
});

