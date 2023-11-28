'use strict';

//variables
var x,x1,x2,y,y1,y2,i,k,bb,ang,cos,sin,sum,sum1,temp,scale,r,templineWidth,I1,I2;

var Fraunhofer=true;
var lineWidth=5;
var shiftkey=false;
var autoBrightness=true;
var monochrome=true;
var I=1;
var mouseDown=false;
var recalculate=false;
var prevmouseX=[undefined,undefined];
var prevmouseY=[undefined,undefined];
var mouseX=0; //mouse position in canvas pixel coords
var mouseY=0;
var rawmx=0;  //mouse pos in raw pixel coords
var rawmy=0;

var λ=.05;
var L=.1;

function clamp(x,min,max){
    return x < min ? min :
           x > max ? max :
           x
    //return ((x-min)%(max-min)+(max-min))%(max-min)+min
}

const canvas = document.getElementById('canvas');
var width=canvas.width;
var height=canvas.height;
const ctx = canvas.getContext('2d');
ctx.lineCap = "round";
//https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
var imageData = ctx.getImageData(0, 0, width, height);
var data = imageData.data;
const dataBuffer=new Uint8Array(height*width);

var tempx=new Float32Array(width*2);
var tempy=new Float32Array(height*2);
const complexDataBuffer=new Float32Array(height*width*2);
ctx.strokeStyle = "#FFFFFF";

const canvas1 = document.getElementById('canvas1');
const ctx1 = canvas1.getContext('2d');
//https://hacks.mozilla.org/2011/12/faster-canvas-pixel-manipulation-with-typed-arrays/
const imageData1 = ctx1.getImageData(0, 0, width, height);
const data1 = imageData1.data;
const dataBuffer1=new Uint8Array(height*width);

const g=new Float32Array(height*width*2);
for(x=0;x<width;x++){
  for(y=0;y<height;y++){
    r=((mod(x+width/2,width)-width/2)**2+(mod(y+height/2,height)-height/2)**2)/L
    g[2*(x+width*y)]=Math.cos(2*Math.PI/λ*r);
    g[2*(x+width*y)+1]=0;//Math.sin(2*Math.PI/λ*r);
  }
}
//fft2d(g,g,width,height,false,false)

document.addEventListener('keydown',(event)=>{
  if(event.key=="Shift"){
    shiftkey=true;
  }
})
document.addEventListener('keyup',(event)=>{
  if(event.key=="Shift"){
    shiftkey=false;
    prevmouseX=[undefined,undefined];
    prevmouseY=[undefined,undefined];
  }
})

document.addEventListener('mousedown',(event)=>{
  mouseDown=true;
  addInk(true);
})

document.addEventListener('mouseup',(event)=>{
  mouseDown=false;
  prevmouseX=[undefined,undefined];
  prevmouseY=[undefined,undefined];
})

document.addEventListener('mousemove',(event)=>{
  rawmx = event.clientX; 
  rawmy = event.clientY;
  if(mouseDown){addInk();}
})

document.addEventListener('touchstart',(event)=>{
  rawmx = event.targetTouches[0].clientX; 
  rawmy = event.targetTouches[0].clientY;
  if(mouseDown){addInk();}
})

document.addEventListener('touchmove',(event)=>{ //https://developer.apple.com/library/archive/documentation/AudioVideo/Conceptual/HTML-canvas-guide/AddingMouseandTouchControlstoCanvas/AddingMouseandTouchControlstoCanvas.html
  event.preventDefault();
  rawmx = event.targetTouches[0].clientX; 
  rawmy = event.targetTouches[0].clientY;
  if(mouseDown){addInk();}
})

function reset(){
  ctx.clearRect(0,0,width,height);
  imageData=ctx.getImageData(0, 0, width, height);
  data=imageData.data;
  draw();
}

function mod(x,m){
  return (x%m+m)%m;
}

function interp(startx,endx,starty,endy,x){
  return starty+(1-1/(Math.exp((x-startx)/(endx-startx)-.5)+1))*(endy-starty);
}

function addInk(move=false){
  bb = canvas.getBoundingClientRect(); 
  ctx.strokeStyle=shiftkey?"#000000":"#FFFFFF";
  templineWidth=shiftkey?50:Math.round(lineWidth);
  ctx.lineWidth = templineWidth;
  mouseX = Math.floor( (rawmx - bb.left) / bb.width * width ); //from https://stackoverflow.com/questions/72379573/get-canvas-pixel-position-from-mouse-coordinates
  mouseY = Math.floor( (rawmy - bb.top) / bb.height * height );
  if((move || shiftkey) && mouseX>0 && mouseX<width && mouseY>0 && mouseY<height){
    for(x=-templineWidth;x<templineWidth+1;x++){
      for(y=-templineWidth;y<templineWidth+1;y++){
        if((x**2+y**2<(templineWidth)**2/4) && (x+mouseX)>0 && (x+mouseX)<width && (y+mouseY)>0 && (y+mouseY)<height){
          data[4*((x+mouseX)+width*(y+mouseY))]=shiftkey?0:255;
          data[4*((x+mouseX)+width*(y+mouseY))+1]=shiftkey?0:255;
          data[4*((x+mouseX)+width*(y+mouseY))+2]=shiftkey?0:255;
          data[4*((x+mouseX)+width*(y+mouseY))+3]=shiftkey?0:255;
        }
      }
    }
    ctx.putImageData(imageData,0,0)
  }
  else{
    if(mouseX>0 && mouseX<width && mouseY>0 && mouseY<height && prevmouseX[0]!=undefined){  
      ctx.beginPath();
      ctx.moveTo(prevmouseX[0]+.5,prevmouseY[0]+.5);
      ctx.lineTo(prevmouseX[1]+.5,prevmouseY[1]+.5);
      ctx.lineTo(mouseX+.5,mouseY+.5);
      ctx.stroke();
    }
    prevmouseX[0]=prevmouseX[1];
    prevmouseY[0]=prevmouseY[1];
    prevmouseX[1]=mouseX;
    prevmouseY[1]=mouseY;
    imageData=ctx.getImageData(0, 0, width, height);
    data=imageData.data;
  }

  draw();
}

function ImtoBuffer(){
  for(x=0;x<width;x++){
    for(y=0;y<height;y++){
      //data[4*(x+width*y)+3]=dataBuffer[x+width*y];
      //data1[4*(x+width*y)+3]=dataBuffer1[x+width*y];
      dataBuffer[x+width*y]=data[4*(x+width*y)]
    }
  }
}

function buffer1toIm1(){
  for(x=0;x<width;x++){
    for(y=0;y<height;y++){
      /*x1=monochrome?x:Math.round(6/7*(x-width/2)+width/2)
      x2=monochrome?x:Math.round(4/7*(x-width/2)+width/2)
      y1=monochrome?y:Math.round(6/7*(y-height/2)+height/2)
      y2=monochrome?y:Math.round(4/7*(y-height/2)+height/2)
      data1[4*(x+width*y)+0]=dataBuffer1[x2+width*y2];
      data1[4*(x+width*y)+1]=dataBuffer1[x1+width*y1];
      data1[4*(x+width*y)+2]=dataBuffer1[x+width*y];
      data1[4*(x+width*y)+3]=255;*/
      data1[4*(x+width*y)+0]=dataBuffer1[x+width*y];
      data1[4*(x+width*y)+1]=dataBuffer1[x+width*y];
      data1[4*(x+width*y)+2]=dataBuffer1[x+width*y];
      data1[4*(x+width*y)+3]=255;
    }
  }
}

function fft(arr,inv){
  if(arr.length==2){
    return arr;
  }
  let out=new Float32Array(arr.length)
  let even = new Float32Array(arr.length>>1);
  let odd = new Float32Array(arr.length>>1);
  for(i=0;i<arr.length;i+=4){
    even[i>>1]=arr[i];
    even[(i>>1)+1]=arr[i+1];
    odd[i>>1]=arr[i+2];
    odd[(i>>1)+1]=arr[i+3];
  }
  even=fft(even);
  odd=fft(odd);
  scale=inv?(1/(arr.length>>1)):1
  for(k=0;k<arr.length>>1;k+=2){
    ang=(inv?1:-1)*2*Math.PI*(k>>1)/(arr.length>>1);
    cos=Math.cos(ang);
    sin=Math.sin(ang);
    out[k]=                   (even[k]+cos*odd[k]-sin*odd[k+1])*scale;
    out[k+1]=                 (even[k+1]+sin*odd[k]+cos*odd[k+1])*scale;
    out[k+(arr.length>>1)]=   (even[k]-cos*odd[k]+sin*odd[k+1])*scale;
    out[k+1+(arr.length>>1)]= (even[k+1]-sin*odd[k]-cos*odd[k+1])*scale;
  }
  return out
}

function fft2d(arr,out,width,height,inv,realInput){
  for(y=0;y<height;y++){
    if(realInput){
      for(x=0;x<width;x++){
        tempx[2*x]=arr[x+width*y];
        tempx[2*x+1]=0;
      }
    }
    else{
      for(x=0;x<width;x++){
        tempx[2*x]=arr[2*(x+width*y)];
        tempx[2*x+1]=arr[2*(x+width*y)+1];
      }      
    }
    tempx=fft(tempx,inv);
    for(x=0;x<width;x++){
      complexDataBuffer[2*(x+width*y)]=tempx[2*x];
      complexDataBuffer[2*(x+width*y)+1]=tempx[2*x+1];
    }
  }
  for(x=0;x<width;x++){
    for(y=0;y<height;y++){
      tempy[2*y]=complexDataBuffer[2*(x+width*y)];
      tempy[2*y+1]=complexDataBuffer[2*(x+width*y)+1];
    }
    tempy=fft(tempy,inv);
    for(y=0;y<height;y++){
      out[2*(x+width*y)]=tempy[2*y];
      out[2*(x+width*y)+1]=tempy[2*y+1];
    }
  }
}

function intensity(arr,out,width,height){
  for(x=0;x<width;x++){
    for(y=0;y<height;y++){
      out[((x+width/2)%width)+width*((y+height/2)%height)]=clamp(((arr[2*(x+width*y)]**2+arr[2*(x+width*y)+1]**2))/(width*height)*I,0,255);
    }
  }
}

function autoI(arr){
    sum=0;
    sum1=0;
    for(i=0;i<arr.length>>1;i++){
      sum+=clamp(((arr[2*i]**2+arr[2*i+1]**2))/(width*height),0,255);
      sum1+=dataBuffer[i]
    }
    if(autoBrightness && sum1!=0){
      I1=255**3/(sum1**2);
      I2=(255*width*height/16)/Math.sqrt(sum**2);
      I=Math.exp(interp(.02,.07,Math.log(I1),Math.log(I2),sum1/(255*width*height)));

      document.getElementById('it').value=Math.log(I);
      document.getElementById('is').value=Math.log(I);
    }
}

function convolve(f,ftg,out,width,height,realInput){  //assumes ftg is the fourier transform of g; realInput for whether f is real or not
  fft2d(f,complexDataBuffer,width,height,false,realInput);
  for(x=0;x<width;x++){
    for(y=0;y<height;y++){
      temp=complexDataBuffer[2*(x+width*y)]
      complexDataBuffer[2*(x+width*y)]=  ftg[2*(x+width*y)]*complexDataBuffer[2*(x+width*y)]-ftg[2*(x+width*y)+1]*complexDataBuffer[2*(x+width*y)+1]
      complexDataBuffer[2*(x+width*y)+1]=ftg[2*(x+width*y)]*complexDataBuffer[2*(x+width*y)+1]+ftg[2*(x+width*y)+1]*temp
    }
  }
  fft2d(complexDataBuffer,out,width,height,true,false);
}

function swap(){
  ctx.putImageData(imageData1,0,0)
  imageData=ctx.getImageData(0, 0, width, height);
  data=imageData.data;
  draw();
}

function draw(){

  ImtoBuffer();
  
  if(Fraunhofer){
    fft2d(dataBuffer,complexDataBuffer,width,height,false,true);
  }
  else{
    convolve(dataBuffer,g,complexDataBuffer,width,height,true)
  }

  if(autoBrightness){
    autoI(complexDataBuffer);
  }

  intensity(complexDataBuffer,dataBuffer1,width,height)
  //intensity(g,dataBuffer1,width,height)
  
  buffer1toIm1();

  ctx1.putImageData(imageData1,0,0)
}


function softdraw(){

  if(autoBrightness){
    autoI(complexDataBuffer);
  }
  intensity(complexDataBuffer,dataBuffer1,width,height)
  //intensity(g,dataBuffer1,width,height)
  buffer1toIm1();
  ctx1.putImageData(imageData1,0,0)
}

