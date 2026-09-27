export const PASSWORD_GUIDANCE = '영문, 숫자, 특수문자를 조합해 8~64자로 입력해주세요.';
export function passwordRules(value: string) {
  return [
    { label: '8~64자', valid: value.length >= 8 && value.length <= 64 },
    { label: '영문 포함', valid: /[A-Za-z]/.test(value) },
    { label: '숫자 포함', valid: /[0-9]/.test(value) },
    { label: '특수문자 포함', valid: /[!-/:-@\[-`{-~]/.test(value) },
    { label: '공백 없이 영문·숫자·특수문자만 사용', valid: /^[\x21-\x7E]+$/.test(value) },
  ];
}
export function isValidPassword(value: string) {
  return passwordRules(value).every((rule) => rule.valid);
}
