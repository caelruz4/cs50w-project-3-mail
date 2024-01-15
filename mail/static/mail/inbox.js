document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
//  submit mail
  // document.querySelector('#compose-form').onsubmit = send_email;
  document.querySelector('#compose-form').addEventListener('submit', send_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function view_email(id) {
  fetch(`/emails/${id}`)
    .then(response => response.json())
    .then(email => {
      // Show email
      document.querySelector('#emails-view').style.display = 'none';
      document.querySelector('#compose-view').style.display = 'none';
      document.querySelector('#emails-view').style.display = 'block';
      document.querySelector('#emails-view').innerHTML =
        `<div class="card">
            <div class="card-header">
                <h3 class="mb-0">From: ${email.sender}</h3>
                <h6 class="text-muted">To: ${email.recipients}</h6>
            </div>
            <div class="card-body">
                <h2 class="card-title">${email.subject}</h2>
                <p class="card-text">${email.body}</p>
                <div class="text-muted">Timestamp: ${email.timestamp}</div>
                <div class="mt-3">
                    <button class="btn btn-outline-primary mr-2" id="reply">Reply</button>
                    <button class="btn btn-outline-primary mr-2" id="unarchive" style="display: ${email.archived ? 'inline-block' : 'none'}">Unarchive</button>
                    <button class="btn btn-outline-primary" id="archive" style="display: ${email.archived ? 'none' : 'inline-block'}">Archive</button>
                </div>
            </div>
        </div>`;

      // change it to read
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          read: true
        })
      })
      // Add reply button functionality
      document.querySelector('#reply').addEventListener('click', () => {
        compose_email();
        document.querySelector('#compose-recipients').value = email.sender;
        document.querySelector('#compose-subject').value = `Re: ${email.subject}`;
        document.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote: \n ${email.body}`;
      })
      // Add archive button functionality
      document.querySelector('#archive').addEventListener('click', () => {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: true
          })
        })
        load_mailbox('archive');
      })

      // unarchive
      document.querySelector('#unarchive').addEventListener('click', () => {
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: false
          })
        })
        load_mailbox('inbox');
      })
    })
}


function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  // Show emails
  fetch(`/emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
      emails.forEach(email => {
        // create a div for each
        console.log(email);
        const mail = document.createElement('div');
        // innerHTml
        mail.innerHTML = 
        `<div class="row">
            <div class="col-md-3 font-weight-bold">From: ${email.sender}</div>
            <div class="col-md-6">${email.subject}</div>
            <div class="col-md-3 text-right">${email.timestamp}</div>
        </div>`;

        // Show if it is read or not
        if (email.read) {
          mail.classList.add('read');
        }
        else {
          mail.classList.add('unread');
        }

        // On click, show the email in detail
        mail.addEventListener('click', () => {
          view_email(email.id);
        })
        document.querySelector('#emails-view').append(mail);

        });
    })
}

// send mail
function send_email(event) {
  event.preventDefault();
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector('#compose-recipients').value,
      subject: document.querySelector('#compose-subject').value,
      body: document.querySelector('#compose-body').value
    })
  })
  .then(response => response.json())
  .then(result => {
    console.log(result);
    load_mailbox('sent');
  });
}
