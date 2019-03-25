export const isEmpty = (str:string):boolean => {
    return str===undefined || str.trim() === '';
}

const emailRegEx = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
export const isMail = (str:string):boolean => {
    return emailRegEx.test(str);
}