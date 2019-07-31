
// Contact Form message
/**
 * emailContactMailer - contact form submission
 * @param {string} obj.to - the email to send the new message to
 * @param {string} obj.contact.name - the submitter's name 
 * @param {string} obj.contact.company - the submitter's company 
 * @param {string} obj.contact.email - the submitter's email 
 * @param {string} obj.contact.message - the submitter's message 
 */
const emailContactMailer = function ({ to, contact: { name, company, email, message }}) {
    console.log({to, name, company, email, message});
    return new Promise((resolve, reject) => {
        const params = {
            Source: to,
            Destination: {
                ToAddresses: [ to ]
            },
            ReplyToAddresses: [
                email
            ],
            Message: {
                Body: {
                    Html: {
                        Charset: "UTF-8",
                        Data: `
                            <h4>New Contact Message</h4>
                            <br><br>
                            <strong>Name:</strong>
                            <p>${name}</p>
                            <strong>Company:</strong>
                            <p>${company}</p>
                            <strong>Email:</strong>
                            <p>${email}</p>
                            <strong>Message:</strong>   
                            <p>${message}</p> 
                        `
                    }
                },
                Subject: {
                    Charset: "UTF-8",
                    Data: "New Contact Form Submission"
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

module.exports = emailContactMailer;