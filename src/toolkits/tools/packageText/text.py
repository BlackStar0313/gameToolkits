#!/usr/bin/python
# -*- coding: utf8 -*-
#Created by zhiwei.liu

import xlrd

from xlrd import XL_CELL_NUMBER 

_excelName = "text.xlsx"
_exportFileFolder = "./"


#对应构造文本进行修改
def writeHead(_writeStream, _className, _rowNum , _colNum):
    print("start write file ......")

    writeStr = ""
    writeStr += "using UnityEngine;\n"
    writeStr += "using System.Collections;\n"
    writeStr += "using ArabicSupport;\n\n\n"
    writeStr += "public static class {0}\n".format(_className)
    writeStr += "{\n"
    writeStr += "\tpublic static string[,] intxt = new string[{0},{1}]\n".format( _colNum, _rowNum)
    _writeStream.write(writeStr)
    return _writeStream
    pass

#对应构造文本进行修改
def writeTail(_writeStream):
    _writeStream.write("\n}")
    _writeStream.close();
    print("end write file .....")
    print("done~~~~")
    pass


#对应构造文本进行修改
def writeToFile(_className ,_dataArray, _dataType, _rowNum , _colNum , _isLastSheet):
    print("write data .........")
    exportFileName = "{0}{1}.cs".format(_exportFileFolder , _className)
    print("exportFileName~~~~",exportFileName )
    writeSteam = open(exportFileName , 'w')
    writeHead(writeSteam,_className , _rowNum-1 , _colNum-1 )

    writeStr = ""

    #the first row is the name of every col
    writeStr += "\t{\n"
    colNames = _dataArray[0]
    for iCol in range(_colNum):
        if iCol < 1:
            continue

        writeStr += "\t\t{\n"
        for iRow in range(_rowNum):
            if iRow < 1:
                continue
            writeStr += "\t\t\t"
            writeStr += u"\"{0}\"".format(_dataArray[iRow][iCol]).encode('utf8')
            writeStr += ",\n"
            idx = _dataArray[iRow][0]
            if idx%5 == 0:
                writeStr += "\t\t\t/*{0}*/\n\n".format(int(idx))

        print("&&&&&& icol {0} colNum {1}".format(iCol , _colNum))
        if iCol != _colNum-1:
            writeStr += "\t\t},\n\n"
            writeStr += "\t\t////////////////////////////////////////////////////////\n"
        else:
            writeStr += "\t\t}\n\n"
        
    writeStr += "\t};\n"
    writeSteam.write(writeStr)
    writeTail(writeSteam)
    pass

def parseExcel():
    print("start parse excel.......")
    book = xlrd.open_workbook(_excelName)

    sheetNum = book.nsheets
    currentSheetIdx = 0
    for s in book.sheets():
        print("sheet ", s.name)

        dataArray = []
        dataType = []
        for row in range(s.nrows):
            values = []
            types = []
            for col in range(s.ncols):
                # print(s.cell(row,col).value)
                values.append(s.cell(row,col).value)
                types.append(s.cell(row,col).ctype)
            dataArray.append(values)
            dataType.append(types)

        isLastSheet = False
        if currentSheetIdx == sheetNum-1:
            isLastSheet = True
            pass
        writeToFile(s.name, dataArray , dataType , s.nrows , s.ncols , isLastSheet)

        currentSheetIdx = currentSheetIdx + 1

    pass

def main():
    parseExcel()
    pass

if __name__ == '__main__':
    main()
