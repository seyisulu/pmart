module.exports = function(opts) {
  var send = function sendMail(to, subject, options) {
    /*
      options:= {
        name: 'Random J. User',
        body: [
          'Welcome,',
          'We hope you like it here.',
          'Please share with your friends on social media <a href="/share>here</a>."'
        ]
      }
    */
    var sg = opts.sendgrid,
        request = sg.emptyRequest({
          method: 'POST',
          path: '/v3/mail/send',
          body: {
            personalizations: [
              {
                to: [
                  {
                    email: to,
                  },
                ],
                subject: subject,
              },
            ],
            from: {
              email: process.env.SG_SDR,
              name:  process.env.SG_SNM
            },
            content: [
              {
                type: 'text/html',
                value: opts.jade.renderFile('views/email.jade', options),
              },
            ],
          },
        });
    return sg.API(request);
  };

  return { send: send };
};
