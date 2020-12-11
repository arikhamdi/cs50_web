document.addEventListener('DOMContentLoaded', function() 
{

  document.querySelector('form').onsubmit = send_email;
  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email()
{
  // Show compose view and hide other views
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function reply_email(email)
{
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector("#compose-recipients").value = email.sender;
  if (email.subject.slice(0,3) === 'Re:' )
  {
    document.querySelector("#compose-subject").value = `${email.subject}`;
  }
  else
  {
    document.querySelector("#compose-subject").value = `Re: ${email.subject}`;
  }
  document.querySelector("#compose-body").value = `\n\nOn ${email.timestamp} ${email.sender} wrote:\n${email.body}`;
}

function load_mailbox(mailbox) 
{
    // Show the mailbox and hide other views
    document.querySelector("#emails-view").style.display = 'block';
    document.querySelector('#compose-view').style.display = 'none';
    document.querySelector('#single-email').style.display = 'none';

    // clear all
    document.querySelector("#emails-view").innerHTML = "";

    // Show the mailbox name
    document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}<h3>`;

    fetch(`emails/${mailbox}`)
    .then(response => response.json())
    .then(emails => {
        // Print emails
        console.log(emails);
        
        // iteration over each email
        emails.forEach(element => {
        const elementDiv = document.createElement('div');
        elementDiv.classList.add('row', 'maillist');

        elementDiv.innerHTML = `<div class="col-lg-9">
                                    <b>${element.sender}</b>  ${element.subject} 
                                </div>
                                <div class="col-lg-3 text-right dating">
                                    ${element.timestamp}
                                </div>`;
        
        // fill in all HTML balise with email data
        // check read status, and change backgroud-color
        // if it is true
        if (element.read === true)
        {
            elementDiv.style.backgroundColor = '#d3d3d3';
            elementDiv.style.color= "#0a0a0a";
        }
        
        elementDiv.addEventListener('click', () => {
          // mark as read
          fetch(`/emails/${element.id}`, {
            method: 'PUT',
            body:JSON.stringify({
              read : true
            })
          })
          // call to function to display selected email 
          load_email(element.id, mailbox);
        });


        // Append all elements in displayed div
        document.querySelector("#emails-view").append(elementDiv); 
    });
  })
  // Catch any errors and log them to the console
  .catch(error => {
    console.log('Error:', error);
  });
}

function load_email(id, mailbox)
{
  // Show the email view and hide other views 
  document.querySelector("#single-email").style.display = "block";
  document.querySelector("#emails-view").style.display = "none";
  document.querySelector('#compose-view').style.display = 'none';
  // clear displayed div
  document.querySelector("#single-email").innerHTML = "";

  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(email => {
      //Print email
      console.log(email);
      // Creating HTML balise to display emails datas
    const elementDiv = document.createElement('div');
    const elementSender = document.createElement('div');
    const elementRecipients = document.createElement('div');
    const elementsubject = document.createElement('div');
    const elementTime = document.createElement('div');
    const elementReply = document.createElement('button');
    const elementHr = document.createElement('hr');
    const elementBody = document.createElement('p');
    const elementArchived = document.createElement('button');
    

    // Add css class to each elements
    elementDiv.classList.add("singleMail");
    elementReply.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    elementArchived.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    
    elementSender.innerHTML += `<b>from: </b> ${email.sender}`;

    // email may have multiple recipients
    // add coma + space after each recipient
    email.recipients.forEach(recipients => {
      elementRecipients.innerHTML += `${recipients}, `;
    })
    // remove the last coma and space for a better design
    elementRecipients.innerHTML = `<b>to: </b> ${elementRecipients.innerHTML.slice(0,-2)}`;
    elementsubject.innerHTML = `<b>Subject: </b>${email.subject}`;
    elementTime.innerHTML = `<b>Timestamp: </b>${email.timestamp}`;
    
    // display Reply button on email
    elementReply.innerHTML = "Reply";

    elementReply.addEventListener('click', () => {
      reply_email(email);
    })
    elementBody.innerHTML = `${email.body}`;

    if (email.archived === false)
    {
      elementArchived.innerHTML = `Click to Archive`;
      var toArchive = true;
    }
    else
    {
      elementArchived.innerHTML = `Click to Unarchive`;
      var toArchive = false;
    }
    // waiting for click event
    // archive or unarchive current email
    // and load inbox after change
    elementArchived.addEventListener('click', () => {
      fetch(`/emails/${email.id}`, {
        method: 'PUT',
        body : JSON.stringify({
          archived : toArchive
        })
      })
      .then(() => load_mailbox('inbox'));
    })
  
    // append all child element to parent div
    elementDiv.append(elementSender);
    elementDiv.append(elementRecipients);
    elementDiv.append(elementsubject);
    elementDiv.append(elementTime);
    if (mailbox !== 'sent')
    {
      elementDiv.append(elementReply);
      elementDiv.append(elementArchived);
    }
    elementDiv.append(elementHr);
    elementDiv.append(elementBody);
    
      

      // Append all elements in displyed div
      document.querySelector("#single-email").append(elementDiv); 
  })
}

function send_email() 
{
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



