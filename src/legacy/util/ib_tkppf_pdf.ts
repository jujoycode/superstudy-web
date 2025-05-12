import { format } from 'date-fns'
import { PDFDocument } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'

interface modifyPDF {
  pdfPath: string
  data: any
}

export const modifyTkppfPdf = async ({ pdfPath, data }: modifyPDF) => {
  try {
    // 프로젝트 내 PDF 파일 로드
    const existingPdfBytes = await fetch(pdfPath).then((res) => res.arrayBuffer())

    // PDF 문서 로드
    const pdfDoc = await PDFDocument.load(existingPdfBytes)

    // fontkit 등록
    pdfDoc.registerFontkit(fontkit)

    // 폰트 파일 로드 및 임베드
    const batangFontBytes = await fetch('/fonts/GowunBatang-Regular.ttf').then((res) => res.arrayBuffer())
    const customBatangFont = await pdfDoc.embedFont(batangFontBytes)

    // PDF 양식 객체 가져오기
    const form = pdfDoc.getForm()

    // // PDF 양식 이름 가져오기 - 확인 용도
    // // Adobe Acrobat Pro 프로그램을 이용해서 필드 이름, 스타일 등 확인할 수 있음
    // const fields = form.getFields();
    // fields.forEach((field) => {
    //   const name = field.getName();
    //   console.log('Field name:', name);
    // });

    // =======================================================
    // 필드 수정 (필드 이름은 PDF 파일에 정의된 이름 사용)

    // Code Field
    const codeField = form.getTextField('Text1')
    codeField.setText('T142') // TODO: 응시코드 - 추후 수정 필요
    const [widget] = codeField.acroField.getWidgets()
    widget.getOrCreateBorderStyle().setWidth(1)

    // Session Field
    const sessionField = form.getTextField('Text2')
    sessionField.setText('Session 1') // TODO: 세션 번호 추후 수정 필요 - 어떤 형식으로 넣어야 하는지 확인 필요
    const [sessionFieldWidget] = sessionField.acroField.getWidgets()
    sessionFieldWidget.getOrCreateBorderStyle().setWidth(1)

    // Prescribed title Field
    const prescribedTitleField = form.getTextField('Text3')
    prescribedTitleField.setText('Prescribed Title')
    const [prescribedTitleFieldWidget] = prescribedTitleField.acroField.getWidgets()
    prescribedTitleFieldWidget.getOrCreateBorderStyle().setWidth(1)

    // First Reflection Session Field
    const first_reflection_session_field = form.getTextField('Text4')
    first_reflection_session_field.setText(data.sequence1.text)

    const [first_reflection_session_field_widget] = first_reflection_session_field.acroField.getWidgets()
    first_reflection_session_field_widget.getOrCreateBorderStyle().setWidth(1)

    // First Reflection Session Date Field
    const first_reflection_date = format(new Date(data.sequence1.updatedAt), 'yyyy.MM.dd')
    const first_reflection_session_month_field = form.getTextField('Text5')
    first_reflection_session_month_field.setText(first_reflection_date)
    const [first_reflection_session_month_field_widget] = first_reflection_session_month_field.acroField.getWidgets()
    first_reflection_session_month_field_widget.getOrCreateBorderStyle().setWidth(1)

    // Second Reflection Session Field
    const second_reflection_session_field = form.getTextField('Text6')
    second_reflection_session_field.setText(data.sequence2.text)

    const [second_reflection_session_field_widget] = second_reflection_session_field.acroField.getWidgets()
    second_reflection_session_field_widget.getOrCreateBorderStyle().setWidth(1)

    // Second Reflection Session Date Field
    const second_reflection_date = format(new Date(data.sequence1.updatedAt), 'yyyy.MM.dd')
    const second_reflection_session_month_field = form.getTextField('Text7')
    second_reflection_session_month_field.setText(second_reflection_date)
    const [second_reflection_session_month_field_widget] = second_reflection_session_month_field.acroField.getWidgets()
    second_reflection_session_month_field_widget.getOrCreateBorderStyle().setWidth(1)

    // Third Reflection Session Field
    const third_reflection_session_field = form.getTextField('Text8')
    third_reflection_session_field.setText(data.sequence3.text)

    const [third_reflection_session_field_widget] = third_reflection_session_field.acroField.getWidgets()
    third_reflection_session_field_widget.getOrCreateBorderStyle().setWidth(1)

    // Third Reflection Session Date Field
    const third_reflection_date = format(new Date(data.sequence1.updatedAt), 'yyyy.MM.dd')
    const third_reflection_session_month_field = form.getTextField('Text9')
    third_reflection_session_month_field.setText(third_reflection_date)
    const [third_reflection_session_month_field_widget] = third_reflection_session_month_field.acroField.getWidgets()
    third_reflection_session_month_field_widget.getOrCreateBorderStyle().setWidth(1)

    // Teacher's Comment Field
    const teacher_comment_field = form.getTextField('Text10')
    teacher_comment_field.setText(data.teacherFeedback)
    const [teacher_comment_field_widget] = teacher_comment_field.acroField.getWidgets()
    teacher_comment_field_widget.getOrCreateBorderStyle().setWidth(1)

    // Candidate name Field
    const candidate_name_field = form.getTextField('Text11')
    candidate_name_field.setText('Candidate Name')
    const [candidate_name_field_widget] = candidate_name_field.acroField.getWidgets()
    candidate_name_field_widget.getOrCreateBorderStyle().setWidth(1)

    // Candidate Session Number Field
    const candidate_session_number_field = form.getTextField('Text12')
    candidate_session_number_field.setText('Candidate Session Number')
    const [candidate_session_number_field_widget] = candidate_session_number_field.acroField.getWidgets()
    candidate_session_number_field_widget.getOrCreateBorderStyle().setWidth(1)

    // Candidate Session Date Field
    const candidate_session_date_field = form.getTextField('Text13')
    candidate_session_date_field.setText('Candidate Session Date')
    const [candidate_session_date_field_widget] = candidate_session_date_field.acroField.getWidgets()
    candidate_session_date_field_widget.getOrCreateBorderStyle().setWidth(1)

    // Teacher's Name Field
    const teacher_name_field = form.getTextField('Text14')
    teacher_name_field.setText(data.teacherSignature)
    const [teacher_name_field_widget] = teacher_name_field.acroField.getWidgets()
    teacher_name_field_widget.getOrCreateBorderStyle().setWidth(1)

    // Teacher Date Field
    const teacher_date_field = form.getTextField('Text15')
    teacher_date_field.setText('Teacher Date')
    const [teacher_date_field_widget] = teacher_date_field.acroField.getWidgets()
    teacher_date_field_widget.getOrCreateBorderStyle().setWidth(1)

    // School Name Field
    const school_name_field = form.getTextField('Text16')
    school_name_field.setText('School Name')
    const [school_name_field_widget] = school_name_field.acroField.getWidgets()
    school_name_field_widget.getOrCreateBorderStyle().setWidth(1)

    // School Number Field
    const school_number_field = form.getTextField('Text17')
    school_number_field.setText('School Number')
    const [school_number_field_widget] = school_number_field.acroField.getWidgets()
    school_number_field_widget.getOrCreateBorderStyle().setWidth(1)

    // 폰트 적용
    first_reflection_session_field.updateAppearances(customBatangFont)
    second_reflection_session_field.updateAppearances(customBatangFont)
    third_reflection_session_field.updateAppearances(customBatangFont)
    teacher_comment_field.updateAppearances(customBatangFont)
    candidate_name_field.updateAppearances(customBatangFont)
    candidate_session_number_field.updateAppearances(customBatangFont)
    candidate_session_date_field.updateAppearances(customBatangFont)
    teacher_name_field.updateAppearances(customBatangFont)
    teacher_date_field.updateAppearances(customBatangFont)
    school_name_field.updateAppearances(customBatangFont)
    school_number_field.updateAppearances(customBatangFont)

    // 필드 수정 끝
    // =======================================================

    // 수정된 PDF 저장
    const pdfBytes = await pdfDoc.save()

    return new Blob([pdfBytes], { type: 'application/pdf' })
  } catch (error) {
    console.error('PDF 수정 중 오류 발생:', error)
  }
}
