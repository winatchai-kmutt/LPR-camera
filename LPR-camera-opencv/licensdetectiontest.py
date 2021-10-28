from os import stat, times
import cv2
import pytesseract
import numpy as np
from scipy import stats
import requests
from datetime import datetime
#####################################
def checkReq(res):
    if res.ok:
        print('POST complete')
    else:
        print('error')
def sendtoserver(frame, num, time):
    imencoded = cv2.imencode(".jpg", frame)[1]
    file = {'Image': ('image.jpg', imencoded.tostring(), 'image/jpeg', {'Expires': '0'})}
    data = {"regis" : num, "detail" : None, "timeIn" : time, "timeOut" : None, "status" : 'on'}
    response = requests.post("https://beta-api-car-check.herokuapp.com/api/posts", files=file, data=data, timeout=5)
    #checkReq(response)
    #print(time)
    return response

def sendtoserverList(frame, frame2, num, time):
    imencoded = cv2.imencode(".jpg", frame)[1]
    imencoded2 = cv2.imencode(".jpg", frame2)[1]
    file_list = [('Image', ('image.jpg', imencoded.tostring(), 'image/jpeg', {'Expires': '0'})),
             ('Image', ('image.jpg', imencoded2.tostring(), 'image/jpeg', {'Expires': '0'}))]
    data = {"regis" : num, "detail" : None, "timeIn" : time, "timeOut" : None, "status" : 'on'}
    response = requests.post("https://beta-api-car-check.herokuapp.com/api/posts", files= file_list, data=data, timeout=5)
    #checkReq(response)
    #print(time)
    return response

def improve(img):
    img = cv2.resize(img, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_CUBIC)
    img_gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    kernel = np.ones((1, 1), np.uint8)
    impro = cv2.dilate(img_gray, kernel, iterations=1)
    impro = cv2.erode(impro, kernel, iterations=1)
    impro = cv2.GaussianBlur(impro, (5, 5), 0)
    impro = cv2.threshold(impro, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]
    impro = cv2.cvtColor(img_gray, cv2.COLOR_BGR2RGB)
    return impro
#####################################
pytesseract.pytesseract.tesseract_cmd = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'
now = datetime.today()
count = 0
saved = []
finish = None
#####################################
CLASSES = ['background',
           'license']
COLORS = np.random.uniform(0,100, size=(len(CLASSES), 3))
net = cv2.dnn.readNetFromCaffe("./lpr.prototxt","./lpr.caffemodel")
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
#####################################
while True:
    ret, frame = cap.read()
    if ret:
        (h,w) = frame.shape[:2]
        blob = cv2.dnn.blobFromImage(frame, 0.007843, (300,300), 127.5)
        net.setInput(blob)
        detections = net.forward()

        for i in np.arange(0, detections.shape[2]):
            percent = detections[0,0,i,2]
            if percent > 0.1:
                class_index = int(detections[0,0,i,1])
                box = detections[0,0,i,3:7]*np.array([w,h,w,h])
                (startX, startY, endX, endY) = box.astype("int")
                label = "{} [{:.2f}%]".format(CLASSES[class_index], percent*100)
                
                imgRoi = frame[startY:endY, startX:endX]
                cv2.imshow("ROI", imgRoi)
                imgBcrop = frame[startY:endY+10, startX:endX]
                imageForCrop = imgBcrop.copy()
                imgTer = improve(imgRoi)
                
                ################################ tesserrect
                hImg, wImg, _ = imgTer.shape 
                cong = r'--oem 3 --psm 6 outputbase digits' 
                boxs = pytesseract.image_to_data(imgTer, config=cong)
                for x,b in enumerate(boxs.splitlines()): 
                    if x!= 0:
                        b = b.split()  
                        if len(b)==12: 
                            x, y, w, h = int(b[6]), int(b[7]), int(b[8]), int(b[9])
                            cv2.rectangle(imgRoi, (x, y), (w+x-5, y+h-5),(0,0,255),3) 
                            cv2.putText(imgRoi, b[11], (x, y), cv2.FONT_HERSHEY_COMPLEX, 0.5, (50,50,255), 2)
                            print(b[11])
                            saved.append(b[11])
                            if len(saved) == 20 :
                                data = stats.mode(saved)
                                mod = data[0][0] 
                                print('Now', mod)
                                if mod != finish or finish == None : 
                                    finish = mod
                                    saved.clear()
                                    cv2.imwrite("./save/"+str(count)+"_car"+".jpg",frame)
                                    cv2.imwrite("./save/"+str(count)+"_plateNum"+".jpg",imageForCrop)
                                    cv2.putText(frame,"Scan Saved",(150,265),cv2.FONT_HERSHEY_DUPLEX,2,(0,0,255),2)
                                    cv2.imshow("Result",frame)
                                    cv2.waitKey(500)
                                    numPlate = '{num}'.format(num = mod)
                                    timeIn = now.strftime("%H:%M:%S %d/%m/%Y ")
                                    carImg  = cv2.imread("./save/"+str(count)+"_car"+".jpg")
                                    plateImg  = cv2.imread("./save/"+str(count)+"_plateNum"+".jpg")
                                    sendtoserverList(carImg, plateImg, numPlate, timeIn)
                                    print('request '+ numPlate+' complete')
                                    count +=1
                            if len(saved) > 20 :
                                saved.clear()
                                print('รถจอดค้าง')

                                              
        cv2.imshow("Frame", frame)
        cv2.waitKey(1)
      
                            
                            
                            
                            
                            
                            



#cap.release()
#cv2.destroyAllWindows()