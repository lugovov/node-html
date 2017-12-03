var monoTags='area,base,br,col,embed,hr,img,input,keygen,link,meta,param,source,track,wbr'.toLowerCase().split(',');
const offsetStep=4;
const escapeTable={
'"':'&quot;',
'\'':'&#39;',
'&':'&amp;',
'<':'&lt;',
'>':'&gt;'
};
const escapeHTML={
'<':'&lt;',
'>':'&gt;'
};


/**
* Формирует настройки по умолчанию
* @return {string} 
*/
var createDefaultOptions=function(){
    return {
	offset: 0, // отступ от края страницы для вывода с форматированием
	pretty: module.exports.pretty, // Выводить с форматированием или нет
    }
}
/**
* Возвращает текущий отступ у строки
* @params {object} options - Текущие опции
* @return {number} 
*/
var getOffset=function(options){
    if(options && options.pretty)
	return options.offset||0;
    return 0;
}
/**
* Заполяет строку пробелами
* @params {number} count - Сколько пробелов сделать
* @params {number} tabsize - Сколько пробелов заменять на табуляцию, по умолчанию 8 пробелов
* @return {string} 
*/
var getSpaces=function(count,tabsize){
    if(!tabsize)
	tabsize=8;
    return '\t'.repeat(Math.floor(count/tabsize))+' '.repeat(count%tabsize);
}
/** 
* Формирует тег
* @param {string} tag - TAG name
* @param {array of objects} attrs - Attributes
* @param {string|object|array of objects} elements - child Elements 
* @return {string} 
*/
var createTag=function(tag,contents,options){
    let text=[];
    let offset=getOffset(options);
    let content=getContent(contents,options);
    tag=tag.toLowerCase()
    return (offset>0?'\n'+getSpaces(offset):'')+'<'+tag+
	(content.attributes.length>0?' '+content.attributes.join(' '):'')+
	(monoTags.indexOf(tag)==-1?'>'+
	    (offset>0||options.pretty?'\n'+getSpaces(offset+offsetStep):'')+content.html.trim()+
	    (offset>0||options.pretty?'\n'+getSpaces(offset):'')+'</'+tag+'>'
	:'/>');
}
/**
* Преобразует текст в безопасную HTML строку
* @params {string} text - Исходный, не безопасный текст
* @return {string}
*/
var text2html=function(text){
    return text.replace(/[<>]/g,function(match){
	return escapeTable[match];
    })
}
/**
* Заменяет не безопасные символы в параметре аттрибута
* @params {string} text - Исходный, не безопасный параметр
* @return {string}
*/
var escapeAttribute=function(text){
    return text.replace(/["'&<>]/g,function(match){ //'"
	return escapeTable[match];
    })
}
/**
* Формирует аттрибут для тега
* @params {string} name - Название аттрибута
* @params {string|number|function} value - Значение аттрибута
* @return {string}
*/
var createAttribute=function(name,value){
    if(typeof value=='function')
	value='('+value.toString()+')()'
    return name+'="'+escapeAttribute(value)+'"';
}
/**
* Возвращает значение и аттрибуты для тега
* @params {string|Array of objects|object} content - Преобразует входные параметры к внутреннему html и/или аттрибутам
* @params {object} options - Текущие опции
* @return {object}
*/
var getContent=function(content,options){
    let result={attributes:[],html:[]};
    let offset=getOffset(options);
    if(typeof content =='string')
	result.html.push(text2html(content));
    else
    if(Array.isArray(content)){
	options.offset+=offsetStep;
	result.html.push(module.exports.html(content,options));
	options.offset-=offsetStep;
    }
    else
    if(typeof content=='object'){
	Object.keys(content).forEach(function(key){
	    if(key=='_text')
		result.html.push(text2html(content[key]));
	    else if(key == '_html')
		result.html.push(content[key]);
	    else if(key.substr(0,1)=='@'){
		result.attributes.push(createAttribute(key.substr(1),content[key]))
	    }
	    else{
		options.offset+=offsetStep;
		result.html.push(createTag(key,content[key],options));
		options.offset-=offsetStep;
	    }
	})
    }
    result.html=result.html.join('')
    return result;
}
/** 
* Вывод с форматированием
*/
module.exports.pretty=false;

/** 
* Формирует HTML
* @param {object|array of objects} elements - child Elements 
* @return {string} 
*/
module.exports.html=function(elements,options){
    let opts,text;
    opts=createDefaultOptions();
    text=[];
    Object.assign(opts,options||{});
    if(Array.isArray(elements)){
	elements.forEach(function(element){
	    text.push(
		module.exports.html(element,options)
	    )
	})
    }else
    if(typeof elements=='object'){
	Object.keys(elements).forEach(function(tag){
	    text.push(createTag(tag,elements[tag],opts));
	})
    }
    return text.join('');
}

module.exports.text2html=text2html;
module.exports.getAttribute=createAttribute;