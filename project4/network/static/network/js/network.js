document.addEventListener('DOMContentLoaded', () => {

    
})

function check_follow(post_id, action)
{
    fetch(`/follow/${post_id}`, {
        method : 'PUT',
        body : JSON.stringify({
            following : action,
        })
    })
    .then(response => response.json())
    .then(result => window.location.reload())
}

function like_post()
{
    
}