/** Neubau TourPilot – Google Apps Script Backend */
const SPREADSHEET_ID='1yD5Mqnev2mAn-fZEBIedVdmd5m2-dqCwXzxe3UZBsPI';
const SHEET_STATIONS='TourPilot_Stationen';
const SHEET_TOURS='TourPilot_Touren';
const SHEET_QUESTIONS='TourPilot_Fragen';

function doGet(e){
  const p=e&&e.parameter?e.parameter:{};
  const cb=p.callback||'callback';
  let out;
  try{
    const a=p.action||'ping';
    if(a==='getStations') out={ok:true,stations:getStations_()};
    else if(a==='saveTour') out={ok:true,tour:saveTour_(p)};
    else if(a==='finishTour') out={ok:true,tour:finishTour_(p)};
    else if(a==='saveQuestion') out={ok:true,question:saveQuestion_(p)};
    else if(a==='getQuestions') out={ok:true,questions:getQuestions_(p.tourId)};
    else out={ok:true,message:'TourPilot API erreichbar.'};
  }catch(err){out={ok:false,error:err.message||String(err)}}
  return jsonp_(cb,out);
}
function jsonp_(cb,obj){const safe=String(cb).replace(/[^a-zA-Z0-9_.$]/g,'');return ContentService.createTextOutput(`${safe}(${JSON.stringify(obj)});`).setMimeType(ContentService.MimeType.JAVASCRIPT)}
function ss_(){return SpreadsheetApp.openById(SPREADSHEET_ID)}
function sheet_(name,headers){const ss=ss_();let sh=ss.getSheetByName(name);if(!sh)sh=ss.insertSheet(name);if(headers&&sh.getLastRow()===0)sh.appendRow(headers);return sh}
function getStations_(){const sh=sheet_(SHEET_STATIONS);const v=sh.getDataRange().getValues();if(v.length<2)return[];const h=v[0].map(x=>String(x).trim());const rows=v.slice(1).map(r=>obj_(h,r)).filter(hasAny_);return route_(rows)}
function route_(rows){const stations=[];rows.forEach(r=>{const nr=clean_(r['Ablauf Rundgang']);if(nr!==''){const topic=clean_(r['Thema']);stations.push({order:nr.toLowerCase&&nr.toLowerCase()==='start'?0:nr,floor:clean_(r['Geschoss']),station:clean_(r['Station'])||(topic?topic.split('\n')[0]:'Station '+nr),access:clean_(r['Zugang über']),topic:topic,special:clean_(r['Spezielles']),way:clean_(r['Wegführung']),nextStation:''})}else{const route=[clean_(r['Zugang über']),clean_(r['Wegführung'])].filter(Boolean).join(' → ');if(route&&stations.length)stations[stations.length-1].way=route}});stations.forEach((s,i)=>s.nextStation=stations[i+1]?stations[i+1].station:'Tour abschliessen');return stations}
function saveTour_(p){const h=['TourID','Datum','Startzeit','Guide','Gruppe','Status','ErstelltAm','AbgeschlossenAm'];const sh=sheet_(SHEET_TOURS,h);ensure_(sh,h);const id=clean_(p.tourId||p.TourID);if(!id)throw new Error('TourID fehlt.');const vals=sh.getDataRange().getValues();const idx=find_(vals,0,id);const rec=[id,clean_(p.date),clean_(p.startTime),clean_(p.guide),clean_(p.group),clean_(p.status||'offen'),new Date(),''];if(idx>-1)sh.getRange(idx+1,1,1,rec.length).setValues([rec]);else sh.appendRow(rec);return obj_(h,rec)}
function finishTour_(p){const h=['TourID','Datum','Startzeit','Guide','Gruppe','Status','ErstelltAm','AbgeschlossenAm'];const sh=sheet_(SHEET_TOURS,h);ensure_(sh,h);const id=clean_(p.tourId||p.TourID);if(!id)throw new Error('TourID fehlt.');const vals=sh.getDataRange().getValues();const idx=find_(vals,0,id),now=new Date();if(idx>-1){sh.getRange(idx+1,6).setValue('abgeschlossen');sh.getRange(idx+1,8).setValue(now)}else sh.appendRow([id,clean_(p.date),clean_(p.startTime),clean_(p.guide),clean_(p.group),'abgeschlossen',new Date(),now]);return{TourID:id,Status:'abgeschlossen',AbgeschlossenAm:now}}
function saveQuestion_(p){const h=['FrageID','TourID','StationNr','Station','Kategorie','Priorität','Frage','Zuständig','Status','Antwort','ErstelltAm'];const sh=sheet_(SHEET_QUESTIONS,h);ensure_(sh,h);const rec=[clean_(p.frageId)||'Q-'+Date.now(),clean_(p.tourId),clean_(p.stationNr),clean_(p.station),clean_(p.category),clean_(p.priority),clean_(p.question),clean_(p.owner),clean_(p.status)||'offen',clean_(p.answer),new Date()];if(!rec[1])throw new Error('TourID fehlt.');if(!rec[6])throw new Error('Frage fehlt.');sh.appendRow(rec);return obj_(h,rec)}
function getQuestions_(tourId){const h=['FrageID','TourID','StationNr','Station','Kategorie','Priorität','Frage','Zuständig','Status','Antwort','ErstelltAm'];const sh=sheet_(SHEET_QUESTIONS,h);ensure_(sh,h);const v=sh.getDataRange().getValues();if(v.length<2)return[];const hh=v[0].map(x=>String(x).trim());return v.slice(1).map(r=>obj_(hh,r)).filter(r=>!tourId||clean_(r.TourID)===clean_(tourId)).map(r=>({frageId:clean_(r.FrageID),tourId:clean_(r.TourID),stationNr:clean_(r.StationNr),station:clean_(r.Station),category:clean_(r.Kategorie),priority:clean_(r['Priorität']),question:clean_(r.Frage),owner:clean_(r['Zuständig']),status:clean_(r.Status)||'offen',answer:clean_(r.Antwort),createdAt:clean_(r.ErstelltAm)})).reverse()}
function obj_(h,r){const o={};h.forEach((x,i)=>o[x]=r[i]);return o}
function hasAny_(r){return Object.keys(r).some(k=>clean_(r[k])!=='')}
function clean_(v){if(v===null||v===undefined)return'';if(v instanceof Date)return Utilities.formatDate(v,Session.getScriptTimeZone(),'yyyy-MM-dd HH:mm');return String(v).replace(/\r/g,'').trim()}
function ensure_(sh,h){if(sh.getLastRow()===0){sh.appendRow(h);return}const cur=sh.getRange(1,1,1,Math.max(h.length,sh.getLastColumn())).getValues()[0];if(!h.every((x,i)=>String(cur[i]||'').trim()===x))sh.getRange(1,1,1,h.length).setValues([h])}
function find_(rows,col,val){for(let i=1;i<rows.length;i++){if(clean_(rows[i][col])===clean_(val))return i}return-1}
