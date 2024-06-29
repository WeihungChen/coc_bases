import { fetchPost, fetchGetJson } from "./common/web.js";
import { serverUrl } from "./common/def_global.js";
import { DateToString, addCommasToNumber, isNumeric } from "./common/globalFunctions.js";
const apiUrl = serverUrl + "/api";
var bases = [];
var current_history = [];

document.getElementById('imageUpload').addEventListener('change', ImgAdd);
document.getElementById('btnUpload').addEventListener('click', upload);
document.getElementById('close').addEventListener('click', closeModal);
document.getElementById('modal-add').addEventListener('click', tabAdd);
document.getElementById('modal-LK').addEventListener('click', modalLinkClicked);
document.getElementById('modal-add-record').addEventListener('click', modalAddRecord);
document.getElementById('attackedImg').addEventListener('change', AttackedImgAdd);
document.getElementById('close_attacked').addEventListener('click', closeAttackedModal);
document.getElementById('select_cup1').addEventListener('change', selectCupChanged);
document.getElementById('select_cup2').addEventListener('change', selectCupChanged);
document.getElementById('select_person').addEventListener('change', SelectPersonChanged);
document.getElementById('name_r').addEventListener('change', cal_stars_and_trophy);
document.getElementById('tag_r').addEventListener('change', cal_stars_and_trophy);
document.getElementById('date_r').addEventListener('change', cal_stars_and_trophy);

document.addEventListener("DOMContentLoaded", function() {
    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");

    tabs.forEach(tab => {
        tab.addEventListener("click", function() {
            tabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");

            const tabId = this.getAttribute("id").replace("tab", "");
            tabContents.forEach(content => {
                content.classList.remove("active");
                if (content.getAttribute("id") === tabId + "Tab") {
                    content.classList.add("active");
                }
            });
        });
    });

    const modalTabs = document.querySelectorAll(".modal-tab");
    const modalTabContents = document.querySelectorAll(".modal-tab-content");
    modalTabs.forEach(tab => {
        tab.addEventListener("click", function() {
            modalTabs.forEach(t => t.classList.remove("active"));
            this.classList.add("active");

            const tabId = this.getAttribute("id").replace("tab", "");
            modalTabContents.forEach(content => {
                content.classList.remove("active");
                if (content.getAttribute("id") === tabId + "Tab") {
                    content.classList.add("active");
                }
            });
        });
    });
});

InitInputObj();
Init();

var players = new Map();
async function Init()
{
    var content = {
        "method": "init"
    };
    var result = await fetchPost(apiUrl, content, 'application/json');
    if(result[0] != 200)
        return;

    const select_base = document.getElementById('select_base');
    select_base.innerHTML = '';
    const ths = result[1].THs;
    for(var i=0; i<ths.length; i++)
    {
        const opt = document.createElement('option');
        opt.value = ths[i].TH;
        opt.innerHTML = ths[i].TH;
        select_base.appendChild(opt);
    }
    const max_cup = Math.ceil(result[1].CupLimit[0].max / 100) * 100;
    const min_cup = Math.floor(result[1].CupLimit[0].min / 100) * 100;
    var cur_cup = min_cup;
    const select_cup1 = document.getElementById('select_cup1');
    select_cup1.innerHTML = '';
    const select_cup2 = document.getElementById('select_cup2');
    select_cup2.innerHTML = '';
    while(cur_cup <= max_cup)
    {
        const opt_l = document.createElement('option');
        opt_l.value = cur_cup;
        opt_l.innerHTML = cur_cup;
        select_cup1.appendChild(opt_l);
        const opt_r = document.createElement('option');
        opt_r.value = cur_cup;
        opt_r.innerHTML = cur_cup;
        select_cup2.appendChild(opt_r);
        cur_cup += 100;
    }
    select_cup2.selectedIndex = select_cup2.options.length - 1;

    const select_person = document.getElementById('select_person');
    select_person.innerHTML = '';
    const people = result[1].People;
    for(var i=0; i<people.length; i++)
    {
        players[people[i].Name] = people[i].Tag;
        if(people[i].historyCount > 0)
        {
            const opt_p = document.createElement('option');
            opt_p.value = people[i].Name;
            opt_p.innerHTML = people[i].Name;
            select_person.appendChild(opt_p);
        }
    }
    select_person.dispatchEvent(new Event('change'));
    bases = result[1].Bases;
    showBases();
    document.getElementById('select_base').addEventListener('change', select_base_changed);
}

function InitInputObj()
{
    const objs = document.querySelectorAll('input');
    for(var i=0; i<objs.length; i++)
        objs[i].addEventListener('focus', SelectALL);
}

async function SelectPersonChanged()
{
    const personal_history_body = document.getElementById('personal_history_body');
    personal_history_body.innerHTML = '';
    var content = {
        "method": "get_person_data",
        "data": {
            "Person": this.value
        }
    };
    var result = await fetchPost(apiUrl, content, 'application/json');
    if(result[0] == 200)
    {
        const his = result[1].His;
        for(var i=0; i<his.length; i++)
        {
            const row = personal_history_body.insertRow(-1);
            const cDate = row.insertCell(-1);
            cDate.id = 'person_' + i + '_date';
            cDate.innerHTML = DateToString(new Date(his[i].Date)).substring(0,10);
            cDate.value = his[i].BaseID + "_" + his[i].Pic;
            cDate.className = 'person_history';
            const cCup = row.insertCell(-1);
            cCup.id = 'person_' + i + "_cup";
            cCup.innerHTML = his[i].Cup;
            cCup.value = his[i].BaseID + "_" + his[i].Pic;
            cCup.className = 'person_history';
            const cReduceTrophy = row.insertCell(-1);
            cReduceTrophy.id = 'person_' + i + "_reducetrophy";
            cReduceTrophy.innerHTML = his[i].ReduceTrophy == null ? '-' : his[i].ReduceTrophy;
            cReduceTrophy.value = his[i].BaseID + "_" + his[i].Pic;
            cReduceTrophy.className = 'person_history';
            const cStar3 = row.insertCell(-1);
            cStar3.id = 'person_' + i + "_star3";
            cStar3.innerHTML = his[i].Star_3;
            cStar3.value = his[i].BaseID + "_" + his[i].Pic;
            cStar3.className = 'person_history';
            const cStar2 = row.insertCell(-1);
            cStar2.id = 'person_' + i + "_star2";
            cStar2.innerHTML = his[i].Star_2;
            cStar2.value = his[i].BaseID + "_" + his[i].Pic;
            cStar2.className = 'person_history';
            const cStar1 = row.insertCell(-1);
            cStar1.id = 'person_' + i + "_star1";
            cStar1.innerHTML = his[i].Star_1;
            cStar1.value = his[i].BaseID + "_" + his[i].Pic;
            cStar1.className = 'person_history';
            const cStar0 = row.insertCell(-1);
            cStar0.id = 'person_' + i + "_star0";
            cStar0.innerHTML = his[i].Star_0;
            cStar0.value = his[i].BaseID + "_" + his[i].Pic;
            cStar0.className = 'person_history';
        }
        const objs = document.querySelectorAll('.person_history');
        for(var i=0; i<objs.length; i++)
            objs[i].addEventListener('click', personalHistoryClicked);
    }
}

function personalHistoryClicked()
{
    const baseID = this.value.split('_')[0];
    const baseidx = bases.findIndex(obj => obj.ID == baseID);
    const pic = this.value.split('_')[1];
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modalImage');
    const modalLink = document.getElementById('modal-LK');
    const modalAdd = document.getElementById('modal-add-record');

    const idx = this.id.split('_')[1];
    const name = document.getElementById('select_person').value;
    const date = document.getElementById('person_' + idx + '_date').innerHTML;
    const cup = document.getElementById('person_' + idx + '_cup').innerHTML;
    const reducetrophy = document.getElementById('person_' + idx + '_reducetrophy').innerHTML;
    document.getElementById('personal_clicked_name').innerHTML = name;
    document.getElementById('personal_clicked_date').innerHTML = date;
    document.getElementById('personal_clicked_cup').innerHTML = cup;
    document.getElementById('personal_clicked_reducetrophy').innerHTML = reducetrophy;

    document.getElementById('personal_attacked_img_div').style.display = 'flex';
    document.getElementById('personal_attacked_img').src = pic;
    document.getElementById('tabOverAll').dispatchEvent(new Event('click'));
    modal.style.display = 'block';
    modalImage.src = bases[baseidx].Pic;
    modalLink.value = baseidx;
    modalAdd.value = baseidx;
    getAndModifyDetail(baseidx);
}

function SelectALL()
{
    this.select();
}

async function selectCupChanged()
{
    const base = document.getElementById('select_base').value;
    const cup1 = document.getElementById('select_cup1').value;
    const cup2 = document.getElementById('select_cup2').value;
    var content = {
        "method": "th_change",
        "data": {
            "TH": base,
            "Max_Cup": Math.max(cup1, cup2),
            "Min_Cup": Math.min(cup1, cup2)
        }
    };
    var result = await fetchPost(apiUrl, content, 'application/json');
    if(result[0] != 200 || result[1] == null || result[1].Bases == null)
        return;

    bases = result[1].Bases;
    showBases();
}

async function select_base_changed()
{
    if(this.value == '')
        return;

    const cup1 = document.getElementById('select_cup1').value;
    const cup2 = document.getElementById('select_cup2').value;
    var content = {
        "method": "th_change",
        "data": {
            "TH": this.value,
            "Max_Cup": Math.max(cup1, cup2),
            "Min_Cup": Math.min(cup1, cup2)
        }
    };
    var result = await fetchPost(apiUrl, content, 'application/json');
    if(result[0] != 200 || result[1] == null || result[1].Bases == null)
        return;

    bases = result[1].Bases;
    showBases();
}

async function showBases()
{
    document.getElementById('l_bases').innerHTML = bases.length + ' Bases';
    const table_base = document.getElementById('table_base');
    table_base.innerHTML = '';
    for(var i=0; i<bases.length; i++)
    {
        const tr = document.createElement('tr');
        const td1 = document.createElement('td');
        const img = document.createElement('img');
        img.className = "img_display thumbnail";
        img.id = i;
        img.src = bases[i].Pic;
        img.style.padding = '5px';
        img.addEventListener('click', showDetails);
        td1.appendChild(img);
        td1.colSpan = 2;
        td1.style.width = '85%';
        tr.appendChild(td1);
        const tr1 = document.createElement('tr');
        const td2 = document.createElement('td');
        td2.innerHTML = '攻擊數: ' + (bases[i].sum == null ? 0 : bases[i].sum);
        tr1.appendChild(td2);
        const td3 = document.createElement('td');
        td3.innerHTML = '三星率: ' + (bases[i].Rate_3 == null ? 0 : Math.round(bases[i].Rate_3 * 10000) / 100) + ' %';
        tr1.appendChild(td3);
        tr1.className = 'base_middle';
        const tr2 = document.createElement('tr');
        const td4 = document.createElement('td');
        td4.innerHTML = '上傳時間:' + DateToString(new Date(bases[i].UploadTime));
        td4.colSpan = 2;
        tr2.appendChild(td4);
        tr2.className = 'base_bottom';
        table_base.appendChild(tr);
        table_base.appendChild(tr1);
        table_base.appendChild(tr2);
    }
}

async function getBaseDetail(idx)
{
    if(idx >= bases.length)
    {
        alert('Error occurred!');
        return;
    }
    const cup1 = document.getElementById('select_cup1').value;
    const cup2 = document.getElementById('select_cup2').value;
    var content = {
        "method": "get_base_detail",
        "data": {
            "BaseID": bases[idx].ID,
            "Max_Cup": Math.max(cup1, cup2),
            "Min_Cup": Math.min(cup1, cup2)
        }
    };
    var result = await fetchPost(apiUrl, content, 'application/json');
    const s3 = document.getElementById('lStar3');
    const s2 = document.getElementById('lStar2');
    const s1 = document.getElementById('lStar1');
    const s0 = document.getElementById('lStar0');
    s3.innerHTML = '';
    s2.innerHTML = '';
    s1.innerHTML = '';
    s0.innerHTML = '';
    if(result[0] == 200)
        return result[1];
    else
    {
        return {
            "Star_3": 0,
            "Star_2": 0,
            "Star_1": 0,
            "Star_0": 0,
            "History": []
        };
    }
}

async function showDetails()
{
    const modal = document.getElementById('modal');
    const modalImage = document.getElementById('modalImage');
    const modalLink = document.getElementById('modal-LK');
    const modalAdd = document.getElementById('modal-add-record');

    modal.style.display = 'block';
    document.getElementById('personal_attacked_img_div').style.display = 'none';
    modalImage.src = this.src;
    modalLink.value = this.id;
    modalAdd.value = this.id;
    getAndModifyDetail(this.id);
}

async function getAndModifyDetail(idx)
{
    const detail = await getBaseDetail(idx);
    const s3 = document.getElementById('lStar3');
    const s2 = document.getElementById('lStar2');
    const s1 = document.getElementById('lStar1');
    const s0 = document.getElementById('lStar0');

    s3.innerHTML = detail.Star_3;
    s2.innerHTML = detail.Star_2;
    s1.innerHTML = detail.Star_1;
    s0.innerHTML = detail.Star_0;

    current_history = detail.History;

    const history_table = document.getElementById('history_body');
    history_table.innerHTML = '';
    for(var i=0; i<current_history.length; i++)
    {
        const row = history_table.insertRow(-1);
        const cName = row.insertCell(-1);
        cName.innerHTML = current_history[i].Name;
        cName.value = i;
        cName.className = 'history_content';
        const cDate = row.insertCell(-1);
        cDate.innerHTML = DateToString(new Date(current_history[i].Date)).substring(0,10);
        cDate.value = i;
        cDate.className = 'history_content';
        const cCup = row.insertCell(-1);
        cCup.innerHTML = current_history[i].Cup;
        cCup.value = i;
        cCup.className = 'history_content';
        const cReduceTrophy = row.insertCell(-1);
        cReduceTrophy.innerHTML = current_history[i].ReduceTrophy == null ? '-' : current_history[i].ReduceTrophy;
        cReduceTrophy.value = i;
        cReduceTrophy.className = 'history_content';
        const cStar3 = row.insertCell(-1);
        cStar3.innerHTML = current_history[i].Star_3;
        cStar3.value = i;
        cStar3.className = 'history_content';
        const cStar2 = row.insertCell(-1);
        cStar2.innerHTML = current_history[i].Star_2;
        cStar2.value = i;
        cStar2.className = 'history_content';
        const cStar1 = row.insertCell(-1);
        cStar1.innerHTML = current_history[i].Star_1;
        cStar1.value = i;
        cStar1.className = 'history_content';
        const cStar0 = row.insertCell(-1);
        cStar0.innerHTML = current_history[i].Star_0;
        cStar0.value = i;
        cStar0.className = 'history_content';
    }

    const objs = document.querySelectorAll('.history_content');
    for(var i=0; i<objs.length; i++)
        objs[i].addEventListener('click', history_clicked);
}

function history_clicked()
{
    if(this.value >= current_history.length)
    {
        alert('Error!!');
        return;
    }
    document.getElementById('modalAttackedImage').src = current_history[this.value].Pic;
    document.getElementById('attackedName').innerHTML = current_history[this.value].Name;
    document.getElementById('attackedDate').innerHTML = DateToString(new Date(current_history[this.value].Date)).substring(0,10);
    document.getElementById('attackedPairedCup').innerHTML = current_history[this.value].Cup;
    document.getElementById('attackedReduceTrophy').innerHTML = current_history[this.value].ReduceTrophy == null ? '-' : current_history[this.value].ReduceTrophy;
    document.getElementById('lStar3_attcked').innerHTML = current_history[this.value].Star_3;
    document.getElementById('lStar2_attcked').innerHTML = current_history[this.value].Star_2;
    document.getElementById('lStar1_attcked').innerHTML = current_history[this.value].Star_1;
    document.getElementById('lStar0_attcked').innerHTML = current_history[this.value].Star_0;
    const modal_attacked = document.getElementById('modal_attacked');
    modal_attacked.style.display = 'block';
}

function modalLinkClicked()
{
    if(this.value >= bases.length)
        return;
    window.open(bases[this.value].Link, '_blank');
}

async function modalAddRecord()
{
    if(this.value >= bases.length)
        return;

    const name = document.getElementById('name_r').value;
    var tag = document.getElementById('tag_r').value;
    const dt = document.getElementById('date_r').value;
    const cup = document.getElementById('cup_r').value;
    const reduce_trophy = document.getElementById('reduce_trophy_r').value;
    const star3 = document.getElementById('lStar3_r').value;
    const star2 = document.getElementById('lStar2_r').value;
    const star1 = document.getElementById('lStar1_r').value;
    const star0 = document.getElementById('lStar0_r').value;
    const imageUpload = document.getElementById('attackedImg');
    if(cup == '' || !isNumeric(cup) || reduce_trophy == '' || !isNumeric(reduce_trophy))
    {
        alert('請填寫正確盃數！');
        return;
    }
    if(dt == '' || name == '' || 
        star3 == '' || !isNumeric(star3) ||
        star2 == '' || !isNumeric(star2) ||
        star1 == '' || !isNumeric(star1) ||
        star0 == '' || !isNumeric(star0))
    {
        alert('請填寫完整資料！');
        return;
    }
    if(parseInt(star3) < 0 || parseInt(star2) < 0 || parseInt(star1) < 0 || parseInt(star0) < 0)
    {
        alert('場數異常！');
        return;
    }
    const total = parseInt(star3) + parseInt(star2) + parseInt(star1) + parseInt(star0);
    if(total > 0 && imageUpload.files.length == 0)
    {
        alert('請上傳防守圖！');
        return;
    }
    if(tag.indexOf('#') == 0)
        tag = tag.substring(1, tag.length);
    const formData = new FormData();
    if(imageUpload.files.length > 0)
        formData.append('file', imageUpload.files[0]);
    else
        formData.append('file', null);
    formData.append('BaseID', bases[this.value].ID);
    formData.append('Name', name);
    formData.append('Tag', tag);
    formData.append('Date', dt);
    formData.append('Cup', cup);
    formData.append('ReduceTrophy', reduce_trophy);
    formData.append('Star_3', star3);
    formData.append('Star_2', star2);
    formData.append('Star_1', star1);
    formData.append('Star_0', star0);
    var content = formData;
    var result = await fetchPost(apiUrl + '/add_new_attacked', content);
    if(result[0] == 200)
    {
        const modalLink = document.getElementById('modal-LK');
        getAndModifyDetail(modalLink.value);
        GetPeople();
        document.getElementById('select_person').dispatchEvent(new Event('change'));
        alert('最新數據已更新');
    }
    else if(result[0] == 300)
    {
        if(confirm(result[2] + '\n是否覆蓋紀錄？'))
        {
            CoverPreviousRecord(formData);
        }
    }
}

async function CoverPreviousRecord(formData)
{
    var content = formData;
    var result = await fetchPost(apiUrl + '/cover_previous_record', content);
    if(result[0] == 200)
    {
        const modalLink = document.getElementById('modal-LK');
        getAndModifyDetail(modalLink.value);
        GetPeople();
        document.getElementById('select_person').dispatchEvent(new Event('change'));
        alert('數據已更新');
    }
}

async function GetPeople()
{
    var content = {
        "method": "get_people"
    };
    var result = await fetchPost(apiUrl, content, 'application/json');
    if(result[0] == 200)
    {
        const select_person = document.getElementById('select_person');
        select_person.innerHTML = '';
        for(var i=0; i<result[1].length; i++)
        {
            players[result[1][i].Name] = result[1][i].Tag;
            if(result[1][i].historyCount > 0)
            {
                const opt_p = document.createElement('option');
                opt_p.value = result[1][i].Name;
                opt_p.innerHTML = result[1][i].Name;
                select_person.appendChild(opt_p);
            }
        }
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function closeAttackedModal()
{
    const modal = document.getElementById('modal_attacked');
    modal.style.display = 'none';
}

function tabAdd() {
    const items = document.querySelectorAll('.modal-add-items');
    if(items.length > 0)
    {
        if(items[0].style.display == 'none')
        {
            for(var i=0; i<items.length; i++)
                items[i].style.display = 'block';
        }
        else
        {
            for(var i=0; i<items.length; i++)
                items[i].style.display = 'none';
        }
    }
}

function AttackedImgAdd()
{
    const imageUpload = document.getElementById('attackedImg');
    const displayArea = document.getElementById('attacked_img_display');

    displayArea.innerHTML = ''; // Clear previous content

    // Display uploaded image if available
    if (imageUpload.files && imageUpload.files[0]) {
        const reader = new FileReader();
 
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.className = "img_display";
            img.src = e.target.result;
            displayArea.appendChild(img);
        };

        reader.readAsDataURL(imageUpload.files[0]);
    }
}

function ImgAdd()
{
    const imageUpload = document.getElementById('imageUpload');
    const displayArea = document.getElementById('displayArea');

    displayArea.innerHTML = ''; // Clear previous content

    // Display uploaded image if available
    if (imageUpload.files && imageUpload.files[0]) {
        const reader = new FileReader();
 
        reader.onload = function(e) {
            const img = document.createElement('img');
            img.className = "img_display";
            img.src = e.target.result;
            displayArea.appendChild(img);
        };

        reader.readAsDataURL(imageUpload.files[0]);
    }
}

async function upload()
{
    const imageUpload = document.getElementById('imageUpload');
    const linkInput = document.getElementById('linkInput');
    const linkUrl = linkInput.value.trim();
    if(linkInput == '')
    {
        alert('Please fill out the link');
        return;
    }
    if(imageUpload.files.length == 0)
    {
        alert('Please choose the base image');
        return;
    }

    const formData = new FormData();
    formData.append('file', imageUpload.files[0]);
    formData.append('url', linkUrl);
    var content = formData;
    var result = await fetchPost(apiUrl + "/upload", content);
    if(result[0] == 200)
        alert('Uploaded');
    Init();
}

const stars_trophy = [4, 15, 32, 40];
async function cal_stars_and_trophy()
{
    const name = document.getElementById('name_r').value;
    var tag = '';
    if(name != '')
    {
        if(this.id != 'name_r' && document.getElementById('tag_r').value != '')
        {
            tag = document.getElementById('tag_r').value;
            if(tag.indexOf('#') == 0)
                tag = tag.substring(1, tag.length);
            if(document.getElementById('tag_r').value.indexOf('#') != 0)
                document.getElementById('tag_r').value = '#' + document.getElementById('tag_r').value;
        }
        else if(players[name] != null)
        {
            tag = players[name];
            document.getElementById('tag_r').value = '#' + tag;
        }
    }
    const dt = document.getElementById('date_r').value;
    if(name == '' || dt == '' || tag == '')
        return;

    var content = {
        "method": "get_legends_day",
        "data": {
            "Tag": tag,
            "Date": dt
        }
    };
    var result = await fetchPost(apiUrl, content, 'application/json');
    if(result[0] == 200)
    {
        if(result[1].InitTrophies)
            document.getElementById('cup_r').value = result[1].InitTrophies;
        if(result[1].LossTrophy)
            document.getElementById('reduce_trophy_r').value = result[1].LossTrophy;
        if(result[1].DefenseStars)
        {
            document.getElementById('lStar0_r').value = result[1].DefenseStars[0];
            document.getElementById('lStar1_r').value = result[1].DefenseStars[1];
            document.getElementById('lStar2_r').value = result[1].DefenseStars[2];
            document.getElementById('lStar3_r').value = result[1].DefenseStars[3];
        }
    }
}