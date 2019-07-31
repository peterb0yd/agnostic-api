
// Account verification
const emailVerificationMailer = function ({from, to, subject, verifyMsg, token}) {
    return new Promise((resolve, reject) => {
        verifyMsg = verifyMsg.replace(/\$CODE/, token);
        const params = {
            Source: from,
            Destination: {
                ToAddresses: [ to ]
            },
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: verifyMsg
                    }
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: subject
                }
            },
        };

        // Send email 
        this.sendEmail(params, (err, data) => {
            if (err) {
                console.log({err});
                reject();  // an error occurred
            } 
            else {
                resolve();     // successful response
            }
        })
    });
};

module.exports = emailVerificationMailer;