/* tslint:disable:radix */
import {FormControl} from '@angular/forms';
import {ValidatorFullMessage, ValidatorShortMessage} from './validator-model';

export function snilsValidator(control: FormControl): ValidatorShortMessage {
  const test = checkSnilsValid(control.value);
  return test.passed ? null : {message: test.error};
}

function checkSnilsValid(snilsRow: string): ValidatorFullMessage {
  // if (!snilsRow || snilsRow.length !== 11 || !+snilsRow) {
  //   return {passed: false, error: 'Проверьте правильность написания СНИЛС'};
  // }
  // const controlCoeffs = [9, 8, 7, 6, 5, 4, 3, 2, 1];
  // let controlSumm = 0;
  // let controlValue = 0;
  // controlSumm = controlCoeffs
  //   .reduce((total, amount, index) =>
  //     total + amount * +snilsRow[index]);
  // // Если сумма меньше 100, то контрольное число равно самой сумме;
  // if (controlSumm < 100) {
  //   controlValue = controlSumm;
  //   // если равна 100, то контрольное число равно 0;
  // } else if (controlSumm === 100 || controlSumm === 101) {
  //   controlValue = 0;
  // } else if (controlSumm > 101) {
  //   if (controlSumm % 101 === 100) {
  //     controlValue = 0;
  //   } else {
  //     controlValue = controlSumm % 101;
  //   }
  // }
  // if (controlValue === +snilsRow.slice(-2)) {
  //   return {passed: true, error: null};
  // } else {
  //   return {passed: false, error: 'Проверьте правильность написания СНИЛС'};
  // }
  // const workSnils = snilsRow;
  // let result = false;
  //
  // try {
  //   if (workSnils.length === 9) {
  //     if (this.SNILSContolCalc(workSnils) > -1) {
  //       result = true;
  //     }
  //   } else if (workSnils.length === 11) {
  //     const controlSum = this.SNILSContolCalc(workSnils);
  //     const strControlSum = +workSnils.substring(9, 2);
  //     if (controlSum === strControlSum) {
  //       result = true;
  //     }
  //   }
  // } catch (e) {
  //   result = false;
  // }
  // else {
  //   throw new Exception(String.Format("Incorrect SNILS number. {0} digits! (it can only be 9 or 11 digits!)", workSnils.Length));
  // }

  if (checkSnils(snilsRow)) {
    return {passed: true, error: null};
  } else {
    return {passed: false, error: 'Проверьте правильность написания СНИЛС'};
  }
}

// function SNILSContolCalc(snils: string) {
//   let workSnils = snils;
//
//   if (workSnils.length !== 9 && workSnils.length !== 11) {
//     throw new Error('Проверьте правильность написания СНИЛС');
//   }
//
//   if (workSnils.length === 11) {
//     workSnils = workSnils.substring(0, 9);
//   }
//
//   let totalSum = 0;
//   for (let i = workSnils.length - 1, j = 0; i >= 0; i--, j++) {
//     const digit = +workSnils[i].toString();
//     totalSum += digit * (j + 1);
//   }
//
//   return this.SNILSCheckControlSum(totalSum);
// }
//
// function SNILSCheckControlSum(_controlSum: number) {
//   let result;
//   if (_controlSum < 100) {
//     result = _controlSum;
//   } else if (_controlSum <= 101) {
//     result = 0;
//   } else {
//     const balance = _controlSum % 101;
//     result = this.SNILSCheckControlSum(balance);
//   }
//   return result;
// }


function calcControlSummSnils(snils) {
  // Проверка суммы


  function checkSumm(s) {
    if (s < 10) {
      return '0' + s;
    }
    if (s < 100) {
      return s;
    }
    if (s === 100 || s === 101) {
      return '00';
    }
    if (s > 101) {
      return checkSumm(s % 101);
    }
  }

  // Расчёт суммы
  let summ = 0;
  for (let i = 0; i < 9; i++) {
    summ += (9 - i) * parseInt(snils[i]);
  }
  return checkSumm(summ);
}

// Перевод массива в строку

function checkSnils(snils): boolean {
  return snils && parseInt(calcControlSummSnils(snils.substring(0, 9))) === parseInt(snils.substring(9, 11));
}
