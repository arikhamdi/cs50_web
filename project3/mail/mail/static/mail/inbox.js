document.addEventListener('DOMContentLoaded', function() {

  document.querySelector('form').onsubmit = send_email;
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // create_HTML();
  // By default, load the inbox
  load_mailbox('inbox');
});

function create_HTML() {
  const h3Element = document.createElement('h3');
  document.querySelector("#emails-view").append(h3Element);
}
function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';


  // get main div et clear all
  const emailsView = document.querySelector("#emails-view");
  emailsView.innerHTML = " ";

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}<h3>`;

  
  
  

  fetch(`emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    // Print emails
    console.log(emails);
    
    emails.forEach(element => {
      const elementDiv = document.createElement('div');
      const elementsubject = document.createElement('h4');
      const elementSender = document.createElement('p');
      const elementRecipients = document.createElement('p');
      const elementBody = document.createElement('p');


      elementDiv.style.padding = "10px";

      elementDiv.classList.add("row");
      elementDiv.classList.add("maillist");
      elementsubject.classList.add("col-sm-12");
      elementRecipients.classList.add("col-sm-7");
      elementSender.classList.add("col-sm-5");
      elementBody.classList.add("col-sm-12");

      if (element.read === true)
      {
        elementDiv.style.backgroundColor = '#d3d3d3';
        elementDiv.style.color= "#0a0a0a";
      }
      
      elementsubject.innerHTML = `${element.subject}`;
      elementSender.innerHTML += `from: ${element.sender}`;
    
      element.recipients.forEach(recipients => {
        elementRecipients.innerHTML += `${recipients}, `;
      })
      elementRecipients.innerHTML = `to: ${elementRecipients.innerHTML.slice(0,-2)}`;
      
      elementBody.innerHTML = `${element.body}`;
  
      elementDiv.append(elementsubject);
      elementDiv.append(elementRecipients);
      elementDiv.append(elementSender);
      elementDiv.append(elementBody);

      emailsView.append(elementDiv);  
    });

  })
  // Catch any errors and log them to the console
  .catch(error => {
    console.log('Error:', error);
  });

  
}

function send_email() {
  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
      recipients: document.querySelector("#compose-recipients").value,
      subject: document.querySelector("#compose-subject").value,
      body: document.querySelector("#compose-body").value
    })
  })
  .then(response => response.json()
  )
  .then(result => {
    // Print result
    console.log('Result:', result);


    if (result['message'] === "Email sent successfully.")
    {
      load_mailbox('sent')
    }
  })
  // Catch any errors and log them to the console
  .catch(error => {
    console.log('Error:', error);
  });

  return false;
}