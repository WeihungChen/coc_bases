import { fetchPost } from "./common/web.js";
import { serverUrl } from "./common/def_global.js";
import { DateToString, addCommasToNumber, isNumeric } from "./common/globalFunctions.js";
const apiUrl = serverUrl + "/api";
var bases = [];

document.getElementById('imageUpload').addEventListener('change', ImgAdd);
document.getElementById('btnUpload').addEventListener('click', upload);
document.getElementById('close').addEventListener('click', closeModal);
document.getElementById('modal-add').addEventListener('click', tabAdd);
document.getElementById('modal-LK').addEventListener('click', modalLinkClicked);
document.getElementById('modal-add-record').addEventListener('click', modalAddRecord);
document.getElementById('attackedImg').addEventListener('change', AttackedImgAdd);

document.addEventListener("DOMContentLoaded", function() {
    const tabs = document.querySelectorAll(".tab");
    const tabContents = document.querySelectorAll(".tab-content");
    console.log(tabs);
    console.log(tabContents);

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

Init();
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
    bases = result[1].Bases;
    showBases();
    document.getElementById('select_base').addEventListener('change', select_base_changed);
}

async function select_base_changed()
{
    if(this.value == '')
        return;

    var content = {
        "method": "th_change",
        "data": {
            "TH": this.value
        }
    };
    var result = await fetchPost(apiUrl, content, 'application/json');
    console.log(result);
    if(result[0] != 200 || result[1] == null || result[1].Bases == null)
        return;

    bases = result[1].Bases;
    showBases();
}

async function showBases()
{
    const table_base = document.getElementById('table_base');
    table_base.innerHTML = '';
    for(var i=0; i<bases.length; i++)
    {
        const tr = document.createElement('tr');
        const img = document.createElement('img');
        img.className = "img_display thumbnail";
        img.id = i;
        img.src = bases[i].Pic;
        img.addEventListener('click', showDetails);
        tr.appendChild(img);
        const tr1 = document.createElement('tr');
        tr1.innerHTML = '上傳時間:' + DateToString(new Date(bases[i].UploadTime));
        table_base.appendChild(tr);
        table_base.appendChild(tr1);
    }
}

async function getBaseDetail(idx)
{
    if(idx >= bases.length)
    {
        alert('Error occurred!');
        return;
    }
    var content = {
        "method": "get_base_detail",
        "data": {
            "BaseID": bases[idx].ID
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
            "Star_0": 0
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
    console.log(detail);
    s3.innerHTML = detail.Star_3;
    s2.innerHTML = detail.Star_2;
    s1.innerHTML = detail.Star_1;
    s0.innerHTML = detail.Star_0;
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
    const dt = document.getElementById('date_r').value;
    const cup = document.getElementById('cup_r').value;
    const star3 = document.getElementById('lStar3_r').value;
    const star2 = document.getElementById('lStar2_r').value;
    const star1 = document.getElementById('lStar1_r').value;
    const star0 = document.getElementById('lStar0_r').value;
    const imageUpload = document.getElementById('attackedImg');
    if(cup == '' || !isNumeric(cup))
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
    if(imageUpload.files.length == 0)
    {
        alert('請上傳防守圖！');
        return;
    }
    const formData = new FormData();
    formData.append('file', imageUpload.files[0]);
    formData.append('BaseID', bases[this.value].ID);
    formData.append('Name', name);
    formData.append('Date', dt);
    formData.append('Cup', cup);
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
        alert('最新數據已更新');
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
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