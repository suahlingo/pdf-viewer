# PDF-VIEWER-APP

## FrontEnd

npx create-react-app pdf-viewer-app
pdf-viewer-app 생성

npm install axios
axios: HTTP 요청을 위한 라이브러리입니다. 서버로 파일을 업로드하거나 데이터를 가져올 때 사용

## BackEnd

pdf-viewer-app -> server -> index.js
npm init -y
npm install express multer pdf.js-extract
express: 웹 서버를 구축하기 위한 프레임워크
multer: 파일 업로드를 처리하는 미들웨어
pdf.js-extract: PDF 파일에서 텍스트를 추출하기 위한 라이브러리

extractTableFromPDF(filePath): pdf.js-extract를 사용하여 지정된 PDF 파일의 특정 페이지에서 텍스트를 추출. 추출된 데이터는 PDF의 페이지별로 나누어져 있으며, 이 데이터를 이용해 테이블을 파싱하는 parseTableFromContent 함수에 전달합니다.

parseTableFromContent(pages): PDFExtract로부터 받은 페이지 데이터를 반복 처리하여, 신·구조문대비표라는 텍스트 이후에 나타나는 테이블 형식의 데이터를 파싱, 각 페이지의 내용을 순회하며 특정 구분선을 기준으로 데이터를 분할하고, 좌표를 기반으로 두 개의 열로 나누어 이중 배열 형태로 저장합니다. 마지막으로, 데이터 정리 및 컬럼 헤더를 추가하여 최종적으로 정리된 이중 배열을 반환

onFileChange(e): 파일 입력 필드에서 파일이 선택될 때 호출되며, 선택된 파일을 file 상태로 저장합니다. 이를 통해 사용자가 선택한 파일을 서버로 업로드할 준비를 합니다. 또한, 새로운 파일을 선택할 때마다 error 상태를 초기화하여 이전에 발생한 오류 메시지를 제거

onFileUpload(): 업로드 버튼이 클릭될 때 호출되며, 선택된 파일을 서버로 전송합니다. FormData 객체를 생성하여 파일을 첨부하고, axios를 사용해 서버의 /upload 엔드포인트로 HTTP POST 요청을 보냅니다. 서버로부터 응답이 성공적으로 돌아오면, 파싱된 PDF 데이터를 parsedContent 상태에 저장하고, 실패할 경우 오류 메시지를 error 상태에 업데이트
