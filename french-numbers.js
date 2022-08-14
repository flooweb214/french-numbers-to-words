class FrenchNumbersToWords
{
    french = 'fr'
    number = 0
    numberParts = []
    numberAsWord = ''
    units = {
        0: "zéro",
        1: "un",
        2: "deux",
        3: "trois",
        4: "quatre",
        5: "cinq",
        6: "six",
        7: "sept",
        8: "huit",
        9: "neuf",
        10: "dix",
        11: "onze",
        12: "douze",
        13: "treize",
        14: "quatorze",
        15: "quinze",
        16: "seize"
    }
    tens = {
        be: {
            10: "dix",
            20: "vingt",
            30: "trente",
            40: "quarante",
            50: "cinquante",
            60: "soixante",
            70: "septante",
            80: "huitante",
            90: "nonante"
        },
        fr: {
            10: "dix",
            20: "vingt",
            30: "trente",
            40: "quarante",
            50: "cinquante",
            60: "soixante",
            70: "soixante-dix",
            80: "quatre-vingt",
            90: "quatre-vingt-dix"
        }
    }
    // The units that we use depending on digits count in the number
    groups = ['', 'mille']

    // We need the number and to define which version of French we are using
    constructor(number = 0, french = 'fr') {
        this.french = french
        this.number = parseInt(number)
        this.numberAsWord = this.splitNumberPerLength()
    }

    splitNumberPerLength() {
        if (this.units[this.number]) {
            // in case we find the number in units (applies to numbers from 0 to 16) we immediately return it
            return this.units[this.number]
        } else {
            // if the number if higher than 16 we split it to groups
            // each group has three digits. Ex: 12345 will have two groups: 12 (for thousands) and 345
            this.numberParts = this.number.toLocaleString().split(',')
            let finalResult = ''
            // loop over those groups
            for (let j = 0; j < this.numberParts.length; j++) {
                finalResult += this.hundred(parseInt(this.numberParts[j]), j)
            }
            return finalResult
        }
    }

    
    /**
     * Due to the rules of French language, we convert the hundreds part and the tens part seperately
     * @param  {[number]} n the number we want to convert to a word
     * @return {[string]}    number being converted to a word
     */
    twoDigitsConverter(n = null) {
        const num = (n != null) ? n : this.number
        let result = ''
        // return nothing in case the value is zero
        if (num == 0) {
            return ''
        }
        if (num % 10 === 0) {
            // check in tens
            result = this.tens[this.french][num]
            // apply the plural format to 80
            if (num == 80) {
                result += 's'
            }
            return result
        } else if (this.units[num]) {
            return this.units[num]
        }
        // get the parts of the number, ex: 58 will be an array of [5, 8]
        const numberParts = num.toString().split('')
        // get the number word from tens array, taking the french type in mind
        result = this.tens[this.french][`${numberParts[0]}0`] + '-'
        if (numberParts[1] == 1 && (numberParts[0] < 7)) {
            // if the number is less than 70
            result += 'et-' + this.units[numberParts[1]]
        } else if ((numberParts[0] < 7) || numberParts[0] == 8) {
            // in case the its is les than 70 or exactly 80
            result += this.units[numberParts[1]]
        } else if ((numberParts[0] == 7) || (numberParts[0] == 9)) {
            // in case of 70 and 90, we make a shift by -10 to the tens rank and shift of +10 to unit rank
            result = this.tens[this.french][`${parseInt(numberParts[0]) - 1}0`] + '-'
            if ((numberParts[0] == 7) && (numberParts[1] == 1)) {
                // 71
                result += 'et-'
            }
            result += this.twoDigitsConverter(parseInt(numberParts[1]) + 10)
        }
        return result
    }

    /**
     * Due to the rules of French language, we convert the hundreds part and the tens part seperately
     * @param  {[number]} n the number we want to convert to a word
     * @param  {[number]} groupIndex which group are we converting so we know the unit (nothing, mille, million etc)
     * @return {[string]}    number being converted to a word
     */
    hundred(n = null, groupIndex) {
        let result = ''
        const num = n != null ? n : this.number
        // calculate how many hundreds do we have in this number
        const hundreds = Math.floor(num / 100)
        // calculate the tens part of the number
        const rest = num % 100
        // get the group unit name
        const group = this.getGroupNameByIndex(groupIndex)


        if ((num == 1)) {
            // if the number is one, just return its unit (in case it has)
            if (groupIndex != (this.numberParts.length - 1) ) {
                return group
            } else {
                // if number is one and it is the in the last group, it will be added to the other groups with "et"
                return '-et-un'
            }
        }
        
        if (hundreds == 0) {
            // ex: we are converting the 12 in 12345
            // no need to worry about the cent unit, just convert the 12
            result = this.twoDigitsConverter(rest)
        } else {
            // here, we are converting a group of 3 digits
            result = 'cent'
            if (hundreds > 1) {
                result = this.twoDigitsConverter(hundreds) + '-' + result
                // in case the hundreds are larger than 1 with no rest and no group unit, ex: 300
                if (rest == 0) {
                    if (!group) {
                        // in case we do not have a unit, add s to the cent (ex: in 200000)
                        result += 's'
                    }
                }
            }
            // get the rest (in case we have it)
            const restAsWord = this.twoDigitsConverter(rest)
            if (restAsWord) {
                if (rest == 1) {
                    result += '-et'
                }
                result += '-' + restAsWord
            }
        }
        if (group) {
            result += '-' + group
        }
        if (groupIndex > 0) {
            result = ' ' + result
        }
        return result
    }
    /**
     * Due to the rules of French language, we convert the hundreds part and the tens part seperately
     * @param  {[number]} groupIndex which group are we converting so we know the unit (nothing, mille, million etc)
     * @return {[string]}    unit of a number (nothing, mille, million etc)
     */
    getGroupNameByIndex(groupIndex) {
        // assume we have a number that is larger than 1 and has unit 
        let suffix = 's'
        if (parseInt(this.numberParts) == 1 ) {
            // remove the unit if it is 1
            suffix = ''
        } else {
            // remove the unit if the unit is not the last word (other groups has a value greater than 0)
            for (let x = groupIndex + 1; x < this.numberParts.length; x++) {
                if (parseInt(this.numberParts[x]) > 0) {
                    suffix = ''
                }
            }
        }
        /*
        get the proper unit, switch the order of array because units are ordered in ASC 
        but we are converting the number groups in DESC order
        */
        let g = this.groups[this.numberParts.length - (groupIndex + 1)]
        if (g) {
            g += suffix
        }
        return g
    }
}


// usage

const numbers = [0, 1, 5, 10, 11, 15, 17, 20, 21, 30, 35, 50, 51, 68, 70, 71, 74, 75, 77, 80, 81, 82, 91, 99, 100, 101, 105, 111, 123, 130, 168, 171, 175, 199, 200, 201, 555, 999, 1000, 1001, 1111, 1199, 1234, 1999, 2000, 2001, 2020, 2021, 2345, 3000, 9999, 10000, 11111, 12345, 123456, 200000, 654321, 999999]
for (let i = 0; i < numbers.length; i++) {
    console.log(numbers[i] + ': ', new FrenchNumbersToWords(numbers[i], 'fr').numberAsWord)
}