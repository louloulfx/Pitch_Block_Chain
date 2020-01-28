import PyPDF2
import json

array = []

pdfFileObject = open(r"./INFO_Maupassant_Bel_Ami.pdf", 'rb')
pdfReader = PyPDF2.PdfFileReader(pdfFileObject)

print(" No. Of Pages :", pdfReader.numPages)

nbPages = pdfReader.numPages

for page in range(nbPages):
    thePage = {}
    thePage["nbPage"] = page+1
    pageObject = pdfReader.getPage(page)
    thePage["content"] = pageObject.extractText()
    array.append(thePage)

final = {}
final["pageArray"] = array

with open('allPages.json', 'w') as outfile:
    json.dump(final, outfile)