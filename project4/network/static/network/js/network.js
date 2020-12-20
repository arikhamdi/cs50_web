document.addEventListener('DOMContentLoaded', () => {
    let falg = 0;
    
})

function edit_follow(post_id, action)
{
    fetch(`/follow/${post_id}`, {
        method : 'PUT',
    })
    .then(result => window.location.reload());
}


function like_post(post_id)
{
    fetch(`/like/${post_id}`, {
        method: 'PUT',
        })
        .then(response => response.json())
        .then(result => {
            if (result['message'] === 'liked')
            {
                const count = parseInt(document.querySelector(`#count_${post_id}`).innerHTML);
                document.querySelector(`#like_${post_id}`).innerHTML = 'unlike';
                document.querySelector(`#count_${post_id}`).innerHTML = `${count + 1}`;
            }
            if (result['message'] === 'unliked')
            {
                const count = parseInt(document.querySelector(`#count_${post_id}`).innerHTML);
                document.querySelector(`#like_${post_id}`).innerHTML = 'like';
                document.querySelector(`#count_${post_id}`).innerHTML = `${count - 1}`;
            }
        });
}

function edit_post(post_id)
{
    

    const post = document.querySelector(`#content_${post_id}`);
    const text = post.innerHTML;
    document.querySelector(`#edit_${post_id}`).style = 'display:none';

    let textArea = `<textarea id="edit_content_${post_id}" class="form-control">${text}</textarea>`;
    const buttonEdit = `<button id="send_${post_id}" class='btn btn-sm btn-primary'>Send</button>`;
    const buttonCancel = `<button id="cancel_${post_id}" class='btn btn-sm btn-outline-primary'>Cancel</button>`;

    post.innerHTML = textArea + buttonEdit + buttonCancel;

    document.querySelector(`#cancel_${post_id}`).addEventListener('click', () => {
        post.innerHTML = text;
        document.querySelector(`#edit_${post_id}`).style = 'display:block';
    });

    document.querySelector(`#send_${post_id}`).addEventListener('click', () => {
        const newContent = document.querySelector(`#edit_content_${post_id}`).value;
        fetch(`edit/${post_id}`, {
            method: 'PUT',
            body : JSON.stringify({
                content : newContent,
            })
        })
        .then(response => response.json())
        .then(result => {

            if (result['message'] === 'success')
            {
                post.innerHTML = result['content'];
                document.querySelector(`#edit_${post_id}`).style = 'display:block';
            }
        });
        
    });

    
}