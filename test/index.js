var html=require('../index.js');
//html.pretty=true
console.log(
    html.html({html:{head:{title:'Тестовая страница'},body:[
	{div:'test'},
	{p:{_text:'test2','@style':'color:red'}},
	{ol:[{li:'one'},{li:'two'}]},
	{input:{'@onclick':function(){alert(1)},'@value':'Нажми меня','@type':'button'}}
    ]}})
)