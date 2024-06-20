function removeCommasToNumber(str) {
    if(str == null)
        return '';
    return str.toString().replace(/,/g, "");
}

function addCommasToNumber(inputNumber) {
    if(inputNumber == null || !isNumeric(inputNumber))
        return inputNumber;
    return inputNumber.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function isNumeric(str) {
    return /^-?\d+(\.\d+)?$/.test(str);
}

function DateToString(date)
{
    if(date != null)
    {
        return ([date.getFullYear(),
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate())
        ].join('-') 
        + ' '
        + [padTo2Digits(date.getHours()),
            padTo2Digits(date.getMinutes()),
            padTo2Digits(date.getSeconds()),
          ].join(':'));
    }
    return date;
}

function isValidDate(date)
{
    return date instanceof Date && !isNaN(date.getTime());
}

export {
    removeCommasToNumber,
    addCommasToNumber,
    isNumeric,
    DateToString,
    isValidDate
}

function padTo2Digits(num) {
    return num.toString().padStart(2, '0');
}