export const Routes = {
  fieldTrip: {
    result: '/fieldtrip/result/approve/:uuid',
    approve: '/fieldtrip/approve/:uuid',
    parent: '/fieldtrip/parent/notice/:uuid',
  },
  studentNewsletter: {
    approve: '/studentnewsletter/approve/:uuid',
  },
  absent: {
    approve: '/absent/approve/:uuid',
  },
  admin: {
    school: '/admin/school',
    teacher: {
      edit: '/admin/teacher/:id/edit',
      batch: '/admin/teacher/batch/new',
      new: '/admin/teacher/new',
      details: '/admin/teacher/:id',
      index: '/admin/teacher',
    },
    student: {
      edit: '/admin/student/:id/edit',
      batch: '/admin/student/batch/new',
      advance: '/admin/student/batch/advance',
      photos: '/admin/student/photos',
      new: '/admin/student/new',
      details: '/admin/student/:id',
      index: '/admin/student',
    },
    parent: {
      edit: '/admin/parent/:id/edit',
      details: '/admin/parent/:id',
      index: '/admin/parent',
    },
    expiredUser: {
      index: '/admin/expired-user',
    },
    klass: {
      new: '/admin/class/new',
      details: '/admin/class/:id',
      index: '/admin/class',
    },
    group: {
      new: '/admin/group/new',
      details: '/admin/group/:id',
      index: '/admin/group',
    },
    approvalLine: '/admin/approval-line',
    timetable: '/admin/timetable',
    sms: '/admin/sms',
    ib: {
      index: '/admin/ib',
      teacher: '/admin/ib/teacher',
      student: '/admin/ib/student',
    },
    score: {
      new: {
        batch: '/admin/score/new/batch',
      },
      details: '/admin/score/:id',
      index: '/admin/score',
    },
    point: {
      edit: '/admin/point/:id/edit',
      new: '/admin/point/new',
      details: '/admin/point/:id',
      index: '/admin/point',
    },
    index: '/admin',
  },
  student: {
    info: '/student/info',
    notice: '/student/notice/:id',
    activity: '/student/activity/:id',
    chat: '/student/chat',
  },
  parent: '/parent-signup',
  auth: {
    student: '/student',
    teacher: '/teacher',
    parent: {
      addChild: '/add-child/:uuid',
    },
    firstLogin: '/first-login',
    login: '/login',
    selectSchool: '/select-school',
    signup: '/signup',
  },
  password: {
    reset: '/reset-password/:id',
    find: '/find-password',
  },
  findId: '/find-id',
  home: '/',
  teacher: {
    canteen: '/teacher/canteen',
    timetable: '/teacher/timetable',
    TimeTable: '/teacher/timetable',
    attendance: '/teacher/attendance',
    absent: '/teacher/absent',
    update: '/teacher/update',
    firstLogin: '/teacher/first-login',
    fieldTrip: {
      notice: '/teacher/fieldtrip/notice',
      result: '/teacher/fieldtrip/result',
      index: '/teacher/fieldtrip',
    },
    board: '/teacher/board',
    calendar: '/teacher/calendar',
    activity: {
      index: '/teacher/activity',
      detail: '/teacher/activity/:id',
    },
    record: '/teacher/record',
    outing: '/teacher/outing',
    manager: '/teacher/manager',
    groups: '/teacher/groups',
    notice: '/teacher/notice',
    chat: '/teacher/chat',
    newsletter: '/teacher/newsletter',
    myPage: '/teacher/mypage',
    login: '/teacher/login',
    index: '/teacher',
  },
} as const
