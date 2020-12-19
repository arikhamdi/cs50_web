document.addEventListener('DOMContentLoaded', () => {

    
})

function check_follow(post_id, action)
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