const { ageClassification, weekFn } = require('./main.js')

describe('ageClassification', () => {
  describe('некоректні значення (від\'ємний вік)', () => {
    test.each([
      [-1, null],
    ])('ageClassification(%s) повертає %s', (input, expected) => {
      expect(ageClassification(input)).toBe(expected)
    })
  })

  describe('діапазон "Дитинство" (num >= 0 && num <= 24)', () => {
    test.each([
      [0, 'Дитинство'],
      [1, 'Дитинство'],
      [24, 'Дитинство'],
    ])('ageClassification(%s) повертає "%s"', (input, expected) => {
      expect(ageClassification(input)).toBe(expected)
    })
  })

  describe('діапазон "Молодість" (24 < num <= 44)', () => {
    test.each([
      [24.01, 'Молодість'],
      [44, 'Молодість'],
    ])('ageClassification(%s) повертає "%s"', (input, expected) => {
      expect(ageClassification(input)).toBe(expected)
    })
  })

  describe('діапазон "Зрілість" (44 < num <= 65)', () => {
    test.each([
      [44.01, 'Зрілість'],
      [65, 'Зрілість'],
    ])('ageClassification(%s) повертає "%s"', (input, expected) => {
      expect(ageClassification(input)).toBe(expected)
    })
  })

  describe('діапазон "Старість" (65 < num <= 75)', () => {
    test.each([
      [65.1, 'Старість'],
      [75, 'Старість'],
    ])('ageClassification(%s) повертає "%s"', (input, expected) => {
      expect(ageClassification(input)).toBe(expected)
    })
  })

  describe('діапазон "Довголіття" (75 < num <= 90)', () => {
    test.each([
      [75.01, 'Довголіття'],
      [90, 'Довголіття'],
    ])('ageClassification(%s) повертає "%s"', (input, expected) => {
      expect(ageClassification(input)).toBe(expected)
    })
  })

  describe('діапазон "Рекорд" (90 < num <= 122)', () => {
    test.each([
      [90.01, 'Рекорд'],
      [122, 'Рекорд'],
    ])('ageClassification(%s) повертає "%s"', (input, expected) => {
      expect(ageClassification(input)).toBe(expected)
    })
  })

  describe('некоректні значення (вік поза межею 122)', () => {
    test.each([
      [122.01, null],
      [150, null],
    ])('ageClassification(%s) повертає %s', (input, expected) => {
      expect(ageClassification(input)).toBe(expected)
    })
  })
})

describe('weekFn', () => {
  describe('коректні номери днів тижня (1-7)', () => {
    test.each([
      [1, 'Понеділок'],
      [2, 'Вівторок'],
      [3, 'Середа'],
      [4, 'Четвер'],
      [5, 'П\'ятниця'],
      [6, 'Субота'],
      [7, 'Неділя'],
    ])('weekFn(%s) повертає "%s"', (input, expected) => {
      expect(weekFn(input)).toBe(expected)
    })
  })

  describe('некоректні значення', () => {
    test.each([
      [9, null],
      [1.5, null],
      ['2', null],
    ])('weekFn(%s) повертає null', (input, expected) => {
      expect(weekFn(input)).toBe(expected)
    })
  })
})
