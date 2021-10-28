const postslist = document.querySelector('.post-list') 
const addPostForm = document.querySelector('.add-post-form')   
const titleValue = document.querySelector('#title-value');
const bodyValue = document.querySelector('#body-value');
const btnSubmit = document.querySelector('.btn') 
let output = ''

const url = 'http://localhost:3000/api/posts'

const renderPost = (post) =>{
    post.forEach(post =>{
        output += `
            <div class="card mt-4 col-md-6 bg-light" >
                    <div class="card-body" data-id= ${post._id}> 
                    <h5 class="card-title">${post.title}</h5>
                    <h6 class="card-subtitle mb-2 text-muted">${post.date}</h6>
                    <p class="card-text">${post.body}</p>
                    <div>
                    <img src="http://localhost:3000/${post.carImage}" class="car">
                    </div>
                    <a href="#" class="card-link" id="edit-post">Edit</a>
                    <a href="#" class="card-link" id="delete-post">Delete</a>
                    </div>
                </div>
        `
    });
    postslist.innerHTML = output 
};


fetch(url)
.then(res => res.json()) 
.then(data => { 
    renderPost(data);
    postslist.addEventListener('click', (event)=>{   
        let delButtonIsPassed = event.target.id == 'delete-post'   
        let editButtonIsPassed = event.target.id == 'edit-post'
        
       let id = event.target.parentElement.dataset.id; 
            if(delButtonIsPassed) {
                fetch(`${url}/${id}`,{
                    method: 'DELETE'
                })  
                .then(res=> res.json()) 
                .then(()=> location.reload()) 
            }
            if(editButtonIsPassed){   
                const  parent = event.target.parentElement;                         
                let titleContent = parent.querySelector('.card-title').textContent; 
                let bodyContent = parent.querySelector('.card-text').textContent; 
                titleValue.value = titleContent
                bodyValue.value = bodyContent
            } 
        btnSubmit.addEventListener('click', (event)=>{      

            event.preventDefault(); 
            fetch(`${url}/${id}`,{       
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    title: titleValue.value,
                    body: bodyValue.value
                })
            })
            
                
                    .then(res => res.json()) 
                    .then(() => location.reload())
            
        })
    })
})

addPostForm.addEventListener('submit',(event)=>{
    event.preventDefault(); 
    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({             
           title: titleValue.value,
           body: bodyValue.value
        })
    })
    .then(res=> res.json())   
    .then(data=> {
        const dataArr = []; 
        dataArr.push(data); 
        renderPost(dataArr)
    })
})
titleValue.value = ''
bodyValue.value = ''


