import fontkit from '@pdf-lib/fontkit'
import { format } from 'date-fns'
import { PDFDocument } from 'pdf-lib'

interface modifyPDF {
  pdfPath: string
  data: any
}

export const modifyRppfPdf = async ({ pdfPath, data }: modifyPDF) => {
  try {
    const dpYear = data.studentGroup.group.grade === 3 ? '2' : '1' // 3학년은 2, 나머지는 1로 설정(원래는 2학년이 1)

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

    // PDF 양식 이름 가져오기 - 확인 용도
    // Adobe Acrobat Pro 프로그램을 이용해서 필드 이름, 스타일 등 확인할 수 있음
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

    // First Reflection Session Field
    const first_reflection_session_field = form.getTextField('Text3')
    first_reflection_session_field.setText(data.contents[0].text)

    const [first_reflection_session_field_widget] = first_reflection_session_field.acroField.getWidgets()
    first_reflection_session_field_widget.getOrCreateBorderStyle().setWidth(1)

    // 폰트 적용
    first_reflection_session_field.updateAppearances(customBatangFont)

    // First Reflection Session Month Field
    const first_reflection_month = format(new Date(data.contents[0].updatedAt), 'MMMM')
    const first_reflection_session_month_field = form.getDropdown('Dropdown1')
    first_reflection_session_month_field.select(first_reflection_month)
    const [first_reflection_session_month_field_widget] = first_reflection_session_month_field.acroField.getWidgets()
    first_reflection_session_month_field_widget.getOrCreateBorderStyle().setWidth(0.5)

    // First Reflection Session DP Year Field
    // 2학년은 DP 1, 3학년은 DP 2
    const first_reflection_session_dp_year_field = form.getDropdown('Dropdown2')
    first_reflection_session_dp_year_field.select(dpYear)
    const [first_reflection_session_dp_year_field_widget] =
      first_reflection_session_dp_year_field.acroField.getWidgets()
    first_reflection_session_dp_year_field_widget.getOrCreateBorderStyle().setWidth(0.5)

    // First Reflection Session Supervisor Field
    const first_reflection_session_supervisor_field = form.getTextField('Text5')
    first_reflection_session_supervisor_field.setText(data.teacherSignature)
    const [first_reflection_session_supervisor_field_widget] =
      first_reflection_session_supervisor_field.acroField.getWidgets()
    first_reflection_session_supervisor_field_widget.getOrCreateBorderStyle().setWidth(1)

    first_reflection_session_supervisor_field.updateAppearances(customBatangFont)

    // Interim Reflection Comment Field
    const interim_reflection_comment_field = form.getTextField('Text6')
    interim_reflection_comment_field.setText(data.contents[1].text)
    const [interim_reflection_comment_field_widget] = interim_reflection_comment_field.acroField.getWidgets()
    interim_reflection_comment_field_widget.getOrCreateBorderStyle().setWidth(1)

    interim_reflection_comment_field.updateAppearances(customBatangFont)

    // Interim Reflection Month Field
    const interim_reflection_month = format(new Date(data.contents[1].updatedAt), 'MMMM')
    const interim_reflection_month_field = form.getDropdown('Dropdown3')
    interim_reflection_month_field.select(interim_reflection_month)
    const [interim_reflection_month_field_widget] = interim_reflection_month_field.acroField.getWidgets()
    interim_reflection_month_field_widget.getOrCreateBorderStyle().setWidth(0.5)

    // Interim Reflection DP Year Field
    // 2학년은 DP 1, 3학년은 DP 2
    const interim_reflection_dp_year_field = form.getDropdown('Dropdown4')
    interim_reflection_dp_year_field.select(dpYear)
    const [interim_reflection_dp_year_field_widget] = interim_reflection_dp_year_field.acroField.getWidgets()
    interim_reflection_dp_year_field_widget.getOrCreateBorderStyle().setWidth(0.5)

    // Interim Reflection Supervisor Field
    const interim_reflection_supervisor_field = form.getTextField('Text8')
    interim_reflection_supervisor_field.setText(data.teacherSignature)
    const [interim_reflection_supervisor_field_widget] = interim_reflection_supervisor_field.acroField.getWidgets()
    interim_reflection_supervisor_field_widget.getOrCreateBorderStyle().setWidth(1)

    interim_reflection_supervisor_field.updateAppearances(customBatangFont)

    // Final Reflection Comment Field
    const final_reflection_comment_field = form.getTextField('Text9')
    final_reflection_comment_field.setText(data.contents[2].text)
    const [final_reflection_comment_field_widget] = final_reflection_comment_field.acroField.getWidgets()
    final_reflection_comment_field_widget.getOrCreateBorderStyle().setWidth(1)

    final_reflection_comment_field.updateAppearances(customBatangFont)

    // Final Reflection Month Field
    const final_reflection_month = format(new Date(data.contents[2].updatedAt), 'MMMM')
    const final_reflection_month_field = form.getDropdown('Dropdown5')
    final_reflection_month_field.select(final_reflection_month)
    const [final_reflection_month_field_widget] = final_reflection_month_field.acroField.getWidgets()
    final_reflection_month_field_widget.getOrCreateBorderStyle().setWidth(0.5)

    // Final Reflection DP Year Field
    // 2학년은 DP 1, 3학년은 DP 2
    const final_reflection_dp_year_field = form.getDropdown('Dropdown6')
    final_reflection_dp_year_field.select(dpYear)
    const [final_reflection_dp_year_field_widget] = final_reflection_dp_year_field.acroField.getWidgets()
    final_reflection_dp_year_field_widget.getOrCreateBorderStyle().setWidth(0.5)

    // Final Reflection Supervisor Field
    const final_reflection_supervisor_field = form.getTextField('Text11')
    final_reflection_supervisor_field.setText(data.teacherSignature)
    const [final_reflection_supervisor_field_widget] = final_reflection_supervisor_field.acroField.getWidgets()
    final_reflection_supervisor_field_widget.getOrCreateBorderStyle().setWidth(1)

    final_reflection_supervisor_field.updateAppearances(customBatangFont)

    // Supervisor Comment Field
    const supervisor_comment_field = form.getTextField('Text12')
    supervisor_comment_field.setText(data.teacherFeedback)
    const [supervisor_comment_field_widget] = supervisor_comment_field.acroField.getWidgets()
    supervisor_comment_field_widget.getOrCreateBorderStyle().setWidth(1)

    supervisor_comment_field.updateAppearances(customBatangFont)

    // 필드 수정 끝
    // =======================================================

    // 수정된 PDF 저장
    const pdfBytes = await pdfDoc.save()

    return new Blob([pdfBytes], { type: 'application/pdf' })
  } catch (error) {
    console.error('PDF 수정 중 오류 발생:', error)
  }
}
