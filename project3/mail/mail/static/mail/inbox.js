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
        
        const elementDiv = create_and_fill(element);
        // Add specific css class to div  
        elementDiv.classList.add("row", "maillist");
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
      // call to function who create balise tag, css class
      // return div element fill in with email data 
      const elementDiv = create_and_fill(email, mailbox);
      // Add specific css class to div
      elementDiv.classList.add("row", "sigleMail");

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

function create_and_fill(element, mailbox)
{
    // Creating HTML balise to display emails datas
    const elementDiv = document.createElement('div');
    const elementsubject = document.createElement('h4');
    const elementSender = document.createElement('p');
    const elementTime = document.createElement('p');
    

    // Add css class to each elements
    elementsubject.classList.add("col-sm-10");
    elementSender.classList.add("col-sm-5");
    elementTime.classList.add("col-sm-12");
    

    // fill in all HTML balise with email data
    // check read status, and change backgroud-color
    // if it is true
    if (element.read === true)
    {
      if (document.querySelector('#emails-view').style.display === 'block')
      {
        elementDiv.style.backgroundColor = '#d3d3d3';
        elementDiv.style.color= "#0a0a0a";
      }
    }

    elementsubject.innerHTML = `${element.subject}`;
    elementSender.innerHTML += `from: ${element.sender}`;
    elementTime.innerHTML = `${element.timestamp}`;
    
    
    // append all child element to parent div
    elementDiv.append(elementsubject);
    // 
    if ((mailbox === 'inbox' || mailbox === 'archive') 
          && document.querySelector('#emails-view').style.display === 'none')
    {
      const elementArchived = document.createElement('button');
      elementArchived.classList.add('btn', 'btn-info', 'col-sm-2');
      
      if (element.archived === false)
      {
        elementArchived.innerHTML = `Click to Archive`;
        var toArchive = true;
      }
      else
      {
        elementArchived.innerHTML = `Click to Unarchive`;
        var toArchive = false;
      }
      
      elementDiv.append(elementArchived);
      elementArchived.addEventListener('click', () => {
        fetch(`/emails/${element.id}`, {
          method: 'PUT',
          body : JSON.stringify({
            archived : toArchive
          })
        })
        load_mailbox('inbox');
      })
    }
    
    elementDiv.append(elementSender);
    
    
    // display Reply button on email
    if (mailbox === 'inbox' || mailbox === 'archive') 
    {
      const elementRecipients = document.createElement('p');
      const elementReply = document.createElement('button');
      const elementBody = document.createElement('p');

      elementReply.classList.add('btn', 'btn-success','col-sm-2','text-center');
      elementBody.classList.add("col-sm-12");
      elementRecipients.classList.add("col-sm-7");

      // email may have multiple recipients
      // add coma + space after each recipient
      element.recipients.forEach(recipients => {
        elementRecipients.innerHTML += `${recipients}, `;
      })
      // remove the last coma and space for a better design
      elementRecipients.innerHTML = `to: ${elementRecipients.innerHTML.slice(0,-2)}`;
      
      elementReply.innerHTML = "Reply";

      elementReply.addEventListener('click', () => {
        reply_email(element);
      })
      elementBody.innerHTML = `${element.body}`;
      


      elementDiv.append(elementRecipients);
      elementDiv.append(elementReply);
      elementDiv.append(elementBody);
    }
    elementDiv.append(elementTime);
    return elementDiv;    
}


