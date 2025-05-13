import { differenceWithSchedules } from './time'

it('잘못된 날짜 형식 들어간 경우', () => {
  expect(differenceWithSchedules('20202020', '123u328238', [])).toEqual(0)
})

it('잘못된 스케줄 형식이 들어간 경우', () => {
  expect(
    differenceWithSchedules('2022-01-01', '2022-01-01', [
      {
        id: 0,
        start: '23020202',
        end: '20202020',
      },
    ]),
  ).toEqual(1)
})

it('시작날짜가 종료날짜보다 큰경우', () => {
  expect(differenceWithSchedules('2022-01-01', '2021-01-01', [])).toEqual(0)
})

it('시작날짜와 종료날짜가 하루 차이인 경우', () => {
  expect(differenceWithSchedules('2022-04-30T00:00:00.000Z', '2022-04-30T07:40:00.000Z', [])).toEqual(1)
  expect(
    differenceWithSchedules('2022-04-30T00:00:00.000Z', '2022-04-30T07:40:00.000Z', [
      {
        id: 1,
        start: '2022-04-30T00:00:00.000Z',
        end: '2022-04-30T07:40:00.000Z',
      },
    ]),
  ).toEqual(0)
})

describe('시작날짜와 종료날짜가 동일한 경우', () => {
  expect(differenceWithSchedules('2021-01-01', '2021-01-01', [])).toEqual(1)

  it('종료날짜가 주말인 경우', () => {
    expect(differenceWithSchedules('2021-11-31', '2021-11-31', [])).toEqual(0)
  })

  it('해당 날짜를 포함하는 스케줄이 있는 경우', () => {
    expect(
      differenceWithSchedules('2021-01-01', '2021-01-01', [
        {
          id: 1,
          start: '2021-01-01',
          end: '2021-01-01',
        },
      ]),
    ).toEqual(0)

    expect(
      differenceWithSchedules('2021-01-01', '2021-01-01', [
        {
          id: 1,
          start: '2020-12-30',
          end: '2021-01-02',
        },
      ]),
    ).toEqual(0)
  })

  it('종료날짜가 주말이고 해당 날짜를 포함하는 스케줄이 있는 경우', () => {
    expect(
      differenceWithSchedules('2021-11-31', '2021-11-31', [
        {
          id: 1,
          start: '2021-11-31',
          end: '2021-11-31',
        },
      ]),
    ).toEqual(0)

    expect(
      differenceWithSchedules('2021-11-31', '2021-11-31', [
        {
          id: 1,
          start: '2021-11-30',
          end: '2021-12-01',
        },
      ]),
    ).toEqual(0)
  })
})

describe('종료날짜가 시작날짜보다 큰 경우', () => {
  expect(differenceWithSchedules('2022-01-03', '2022-01-04', [])).toEqual(2)

  it('종료날짜가 주말인 경우', () => {
    expect(differenceWithSchedules('2022-01-07', '2022-01-08', [])).toEqual(1)
  })
  it('종료날짜가 주말이고 스케줄이 있는 경우', () => {
    expect(
      differenceWithSchedules('2022-01-07', '2022-01-08', [
        {
          id: 1,
          start: '2022-01-07',
          end: '2022-01-07',
        },
      ]),
    ).toEqual(0)
  })
  it('시작날짜가 주말인 경우', () => {
    expect(differenceWithSchedules('2022-01-09', '2022-01-10', [])).toEqual(1)
  })
  it('시작날짜가 주말이고 스케줄이 있는 경우', () => {
    expect(
      differenceWithSchedules('2022-01-09', '2022-01-10', [
        {
          id: 1,
          start: '2022-01-10',
          end: '2022-01-10',
        },
      ]),
    ).toEqual(0)
  })
  it('시작날짜와 종료날짜가 둘 다 주말인 경우', () => {
    expect(differenceWithSchedules('2022-01-08', '2022-01-15', [])).toEqual(5)
  })
  it('시작날짜와 종료날짜가 둘 다 주말이고 안에 스케줄이 있는 경우', () => {
    expect(
      differenceWithSchedules('2022-01-08', '2022-01-15', [
        {
          id: 1,
          start: '2022-01-10',
          end: '2022-01-10',
        },
      ]),
    ).toEqual(4)
  })

  it('시작날짜가 string이고 종료날짜가 timezone utc string일때', () => {
    expect(
      differenceWithSchedules('2022-04-01', '2022-04-03T15:00:00.000Z', [
        {
          id: 1,
          end: '2022-04-29T14:59:59.999Z',
          start: '2022-04-28T15:00:00.000Z',
        },
        {
          id: 2,
          end: '2022-05-05T14:59:59.999Z',
          start: '2022-05-04T15:00:00.000Z',
        },
        {
          id: 3,
          end: '2022-05-06T14:59:59.999Z',
          start: '2022-05-05T15:00:00.000Z',
        },
      ]),
    ).toEqual(2)
  })
})
