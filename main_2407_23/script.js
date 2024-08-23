import { fetchPost, fetchGetJson } from "./common/web.js";
import { serverUrl } from "./common/def_global.js";
import { DateToString, isNumeric } from "./common/globalFunctions.js";
const apiUrl = serverUrl + "/api";
var bases = [];
var current_history = [];
var tag_spelltower = null;
var tag_others = null;
var first = true;

document.getElementById('imageUpload').addEventListener('change', ImgAdd);
document.getElementById('btnUpload').addEventListener('click', upload);
document.getElementById('close').addEventListener('click', closeModal);
document.getElementById('modal-add').addEventListener('click', tabAdd);
document.getElementById('modal-add-player').addEventListener('click', tabAddPlayer);
document.getElementById('modal-LK').addEventListener('click', modalLinkClicked);
document.getElementById('modal-add-record').addEventListener('click', modalAddRecord);
document.getElementById('btn-add-player').addEventListener('click', modalAddPlayer);
document.getElementById('attackedImg').addEventListener('change', AttackedImgAdd);
document.getElementById('close_attacked').addEventListener('click', closeAttackedModal);
document.getElementById('legend_data').addEventListener('click', openLegendData);
document.getElementById('close_legend_data').addEventListener('click', closeLegendData);
document.getElementById('close_tags_upd').addEventListener('click', closeTagsUpd);
document.getElementById('select_person').addEventListener('change', SelectPersonChanged);
document.getElementById('select_legend_person').addEventListener('change', SelectLegendPersonChanged);
document.getElementById('select_legend_season').addEventListener('change', SelectLegendSeasonChanged);
document.getElementById('name_r').addEventListener('change', cal_stars_and_trophy);
document.getElementById('tag_r').addEventListener('change', cal_stars_and_trophy);
document.getElementById('date_r').addEventListener('change', cal_stars_and_trophy);
document.getElementById('tag_r_add_player').addEventListener('change', add_player_tag_change);
document.getElementById('s_cup').addEventListener('click', show_select_base);
document.getElementById('s_date').addEventListener('click', show_select_base);
document.getElementById('s_use_date').addEventListener('click', show_select_base);
document.getElementById('s_sort').addEventListener('click', show_select_base);
document.getElementById('s_tags').addEventListener('click', show_select_base);
document.getElementById('close_base_select').addEventListener('click', closeBaseSelect);
document.getElementById('new_spelltower_tag').addEventListener('change', new_tag_added);
document.getElementById('new_other_tag').addEventListener('change', new_tag_added);
document.getElementById('tags_upd_new_spelltower_tag').addEventListener('change', tags_upd_new_tag_added);
document.getElementById('tags_upd_new_other_tag').addEventListener('change', tags_upd_new_tag_added);
document.getElementById('btn-tags-upd').addEventListener('click', tags_upd_btn_clicked);

function LoadChartComponent()
{
	var link_chart = document.createElement('script');
	link_chart.src = 'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.6.0/Chart.min.js';
	document.head.appendChild(link_chart);
}

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
    if(first)
    {
        LoadChartComponent();
        first = false;
    }
    
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

    const sort_categories = result[1].Sort_Categories;
    const select_sort = document.getElementById('select_sort');
    if(select_sort.innerHTML == '' && sort_categories.length > 0)
    {
        for(var i=0; i<sort_categories.length; i++)
        {
            const opt = document.createElement('option');
            opt.value = sort_categories[i].Index;
            opt.innerHTML = sort_categories[i].Name;
            select_sort.appendChild(opt);
        }
        document.getElementById('s_sort').innerHTML = '排序: ' + sort_categories[0].Name;
    }

    const select_legend_person = document.getElementById('select_legend_person');
    select_legend_person.innerHTML = '';
    const select_person = document.getElementById('select_person');
    select_person.innerHTML = '';
    const people = result[1].People;
    var tag = '';
    for(var i=0; i<people.length; i++)
    {
        if(i == 0)
            tag = people[i].Tag;
        players[people[i].Name] = people[i].Tag;
        if(people[i].historyCount > 0)
        {
            const opt_p = document.createElement('option');
            opt_p.value = people[i].Name;
            opt_p.innerHTML = people[i].Name;
            select_person.appendChild(opt_p);
        }
        const opt_legend_data = document.createElement('option');
        opt_legend_data.value = people[i].Tag;
        opt_legend_data.innerHTML = people[i].Name;
        select_legend_person.appendChild(opt_legend_data);
    }

    tag_temp.length = 0;
    tag_spelltower = result[1].Tag_SpellTower;
    const d_tower_tags = document.getElementById('d_tower_tags');
    const tags_upd_spelltower = document.getElementById('tags_upd_spelltower');
    const upload_spelltower_tags = document.getElementById('upload_spelltower_tags');
    d_tower_tags.innerHTML = '';
    tags_upd_spelltower.innerHTML = '';
    upload_spelltower_tags.innerHTML = '';
    for(var i=0; i<tag_spelltower.length; i++)
    {
        const l = document.createElement('label');
        l.innerHTML = tag_spelltower[i].TagName;
        l.value = tag_spelltower[i].ID;
        l.className = 'label_tag';
        l.addEventListener('click', tag_clicked);
        d_tower_tags.appendChild(l);
        const l_upd = document.createElement('label');
        l_upd.innerHTML = tag_spelltower[i].TagName;
        l_upd.value = tag_spelltower[i].ID;
        l_upd.className = 'label_tags_upd';
        l_upd.addEventListener('click', tag_upd_clicked);
        tags_upd_spelltower.appendChild(l_upd);
        const l_u = document.createElement('label');
        l_u.innerHTML = tag_spelltower[i].TagName;
        l_u.value = tag_spelltower[i].ID;
        l_u.className = 'label_tag_upload';
        l_u.addEventListener('click', tag_upload_clicked);
        upload_spelltower_tags.appendChild(l_u);
    }
    tag_others = result[1].Tag_Others;
    const d_other_tags = document.getElementById('d_other_tags');
    const tags_upd_others = document.getElementById('tags_upd_others');
    const upload_other_tags = document.getElementById('upload_other_tags');
    d_other_tags.innerHTML = '';
    tags_upd_others.innerHTML = '';
    upload_other_tags.innerHTML = '';
    for(var i=0; i<tag_others.length; i++)
    {
        const l = document.createElement('label');
        l.innerHTML = tag_others[i].TagName;
        l.value = tag_others[i].ID;
        l.className = 'label_tag';
        l.addEventListener('click', tag_clicked);
        d_other_tags.appendChild(l);
        const l_upd = document.createElement('label');
        l_upd.innerHTML = tag_others[i].TagName;
        l_upd.value = tag_others[i].ID;
        l_upd.className = 'label_tags_upd';
        l_upd.addEventListener('click', tag_upd_clicked);
        tags_upd_others.appendChild(l_upd);
        const l_u = document.createElement('label');
        l_u.innerHTML = tag_others[i].TagName;
        l_u.value = tag_others[i].ID;
        l_u.className = 'label_tag_upload';
        l_u.addEventListener('click', tag_upload_clicked);
        upload_other_tags.appendChild(l_u);
    }
    document.getElementById('s_tags').innerHTML = "標籤: 無";

    select_person.dispatchEvent(new Event('change'));
    select_legend_person.dispatchEvent(new Event('change'));
    bases = result[1].Bases;
    showBases();
    document.getElementById('select_use_date1').value = result[1].Use_Start_Date;
    document.getElementById('select_use_date2').value = result[1].Use_End_Date;
    const cup1 = document.getElementById('select_cup1').value;
    const cup2 = document.getElementById('select_cup2').value;
    document.getElementById('s_cup').innerHTML = "盃段: " + cup1 + " ~ " + cup2;
    document.getElementById('s_date').innerHTML = "上傳時間: All";
    document.getElementById('s_use_date').innerHTML = "使用期間: " + result[1].Use_Start_Date + " ~ " + result[1].Use_End_Date;
}

function tag_clicked()
{
    if(this.className == 'label_tag')
        this.className = 'label_tag_selected';
    else if(this.className == 'label_tag_selected')
        this.className = 'label_tag';
}

function tag_upd_clicked()
{
    if(this.className == 'label_tags_upd')
    {
        if(this.parentNode.id == 'tags_upd_spelltower')
        {
            const children = this.parentNode.children;
            for(var i=0; i<children.length; i++)
                children[i].className = 'label_tags_upd';
        }
        this.className = 'label_tags_upd_selected';
    }
    else if(this.className == 'label_tags_upd_selected')
        this.className = 'label_tags_upd';
}

function tag_upload_clicked()
{
    if(this.className == 'label_tag_upload')
    {
        if(this.parentNode.id == 'upload_spelltower_tags')
        {
            const children = this.parentNode.children;
            for(var i=0; i<children.length; i++)
                children[i].className = 'label_tag_upload';
        }
        this.className = 'label_tag_upload_selected';
    }
    else if(this.className == 'label_tag_upload_selected')
        this.className = 'label_tag_upload';
}

const tags_upd_tag_temp = [];
function tags_upd_new_tag_added()
{
    if(this.value == '')
        return;
    var d = null;
    if(tag_spelltower.findIndex(obj => obj.TagName == this.value) != -1 || tag_others.findIndex(obj => obj.TagName == this.value) != -1 || tags_upd_tag_temp.findIndex(obj => obj.TagName == this.value) != -1)
    {
        alert('已有相同名稱之標籤');
        return;
    }
    if(this.id == 'tags_upd_new_spelltower_tag')
    {
        d = document.getElementById('tags_upd_spelltower');
    }
    else if(this.id == 'tags_upd_new_other_tag')
    {
        d = document.getElementById('tags_upd_others');
    }
    if(d == null)
        return;
    const new_tag = document.createElement('label');
    new_tag.className = 'label_tags_upd';
    new_tag.innerHTML = this.value;
    new_tag.value = -1;
    new_tag.addEventListener('click', tag_upd_clicked);
    d.appendChild(new_tag);
    tags_upd_tag_temp[tags_upd_tag_temp.length] = {
        "TagName": this.value,
        "SpellTower": this.id == 'tags_upd_new_spelltower_tag' ? 1 : 0
    };
}

const tag_temp = [];
function new_tag_added()
{
    if(this.value == '')
        return;
    var d = null;
    if(tag_spelltower.findIndex(obj => obj.TagName == this.value) != -1 || tag_others.findIndex(obj => obj.TagName == this.value) != -1 || tag_temp.findIndex(obj => obj.TagName == this.value) != -1)
    {
        alert('已有相同名稱之標籤');
        return;
    }
    if(this.id == 'new_spelltower_tag')
    {
        d = document.getElementById('upload_spelltower_tags');
    }
    else if(this.id == 'new_other_tag')
    {
        d = document.getElementById('upload_other_tags');
    }
    if(d == null)
        return;
    const new_tag = document.createElement('label');
    new_tag.className = 'label_tag_upload';
    new_tag.innerHTML = this.value;
    new_tag.value = -1;
    new_tag.addEventListener('click', tag_upload_clicked);
    d.appendChild(new_tag);
    tag_temp[tag_temp.length] = {
        "TagName": this.value,
        "SpellTower": this.id == 'new_spelltower_tag' ? 1 : 0
    };
}

function InitInputObj()
{
    const objs = document.querySelectorAll('input');
    for(var i=0; i<objs.length; i++)
        objs[i].addEventListener('focus', SelectALL);
}

async function SelectLegendSeasonChanged()
{
    const tag = document.getElementById('select_legend_person').value;
    const season = this.value;
    if(tag == null || tag == '' || season == null || season == '')
        return;

    var content = {
        "method": "get_legends_season_data",
        "data": {
            "Tag": tag,
            "Season": season
        }
    };
    var result = await fetchPost(apiUrl, content, 'application/json');
    if(result[0] == 200)
    {
        const ret = result[1];
        const chartData = new Map();
        var maxDay = 0;
        for(var i=0; i<ret.History.length; i++)
        {
            if(maxDay == 0)
                maxDay = ret.History[i].Day;
            chartData[ret.History[i].Day] = [ret.History[i].FinalTrophies];
        }
        document.getElementById('avgATK').innerHTML = 'Avg. ATK: ' + ret.AvgGain;
        document.getElementById('avgDEF').innerHTML = 'Avg. DEF: ' + ret.AvgLoss;
        const body_legend_data = document.getElementById('body_legend_data');
        body_legend_data.innerHTML = '';
        for(var i=0; i<ret.Legends.length; i++)
        {
            const row = body_legend_data.insertRow(-1);
            const cDay = row.insertCell(-1);
            cDay.innerHTML = ret.Legends[i].Day;
            cDay.className = 'legend_content';
            const cDT = row.insertCell(-1);
            cDT.innerHTML = ret.Legends[i].Date;
            cDT.className = 'legend_content';
            cDT.colSpan = 2;
            const cInit = row.insertCell(-1);
            cInit.innerHTML = ret.Legends[i].InitTrophies;
            cInit.className = 'legend_content';
            const cGain = row.insertCell(-1);
            cGain.innerHTML = ret.Legends[i].GainTrophy + ' <label class="small-print">' + ret.Legends[i].Attacks.length + '</label>';
            cGain.className = 'legend_content';
            const cLoss = row.insertCell(-1);
            cLoss.innerHTML = ret.Legends[i].LossTrophy + ' <label class="small-print">' + ret.Legends[i].Defenses.length + '</label>';
            cLoss.className = 'legend_content';
            const cDif = row.insertCell(-1);
            cDif.innerHTML = ret.Legends[i].Dif;
            cDif.className = 'legend_content';
            const cFinal = row.insertCell(-1);
            cFinal.innerHTML = ret.Legends[i].FinalTrophies;
            cFinal.className = 'legend_content';

            chartData[ret.Legends[i].Day][chartData[ret.Legends[i].Day].length] = ret.Legends[i].FinalTrophies;
        }
        DrawChart(chartData, maxDay);
    }
}

async function SelectLegendPersonChanged()
{
    const tag = this.value;
    if(tag == null || tag == '')
        return;
    const select_legend_season = document.getElementById('select_legend_season');
    select_legend_season.innerHTML = '';
    var content = {
        "method": "get_legends_seasons_by_player",
        "data": {
            "Tag": tag
        }
    };
    var result = await fetchPost(apiUrl, content, 'application/json');
    if(result[0] == 200)
    {
        if(result[1].length == 0)
        {
            document.getElementById('body_legend_data').innerHTML = '';
            document.getElementById('avgATK').innerHTML = 'Avg. ATK: -';
            document.getElementById('avgDEF').innerHTML = 'Avg. DEF: -';
            return;
        }
        for(var i=0; i<result[1].length; i++)
        {
            const opt = document.createElement('option');
            opt.value = result[1][i].Season;
            opt.innerHTML = result[1][i].Season;
            select_legend_season.appendChild(opt);
        }
        select_legend_season.dispatchEvent(new Event('change'));
    }
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

async function queryBases()
{
    const base = document.getElementById('select_base').value;
    const cup1 = document.getElementById('select_cup1').value;
    const cup2 = document.getElementById('select_cup2').value;
    const select_date1 = document.getElementById('select_date1').value;
    const select_date2 = document.getElementById('select_date2').value;
    const select_use_date1 = document.getElementById('select_use_date1').value;
    const select_use_date2 = document.getElementById('select_use_date2').value;
    const select_sort = parseInt(document.getElementById('select_sort').value);
    const select_tag = document.querySelectorAll('.label_tag_selected');
    var content = {
        "method": "th_change",
        "data": {
            "TH": base,
            "Max_Cup": Math.max(cup1, cup2),
            "Min_Cup": Math.min(cup1, cup2),
            "Start_Date": select_date1 == '' ? null : select_date1,
            "End_Date": select_date2 == '' ? null : select_date2,
            "Use_Start_Date": select_use_date1 == '' ? null : select_use_date1,
            "Use_End_Date": select_use_date2 == '' ? null : select_use_date2,
            "Sort_Category": select_sort,
            "Tags": null
        }
    };
    var label_tags = '';
    if(select_tag.length > 0)
    {
        content.data.Tags = [];
        for(var i=0; i<select_tag.length; i++)
        {
            content.data.Tags[content.data.Tags.length] = select_tag[i].value;
            label_tags += select_tag[i].innerHTML;
            if(i < select_tag.length - 1)
                label_tags += ",";
        }
    }
    var result = await fetchPost(apiUrl, content, 'application/json');
    if(result[0] != 200 || result[1] == null || result[1].Bases == null)
        return;

    bases = result[1].Bases;
    showBases();
    document.getElementById('s_cup').innerHTML = "盃段: " + cup1 + " ~ " + cup2;
    var upDT = 'All';
    if(select_date1 != '')
        upDT = select_date1 + ' ~';
    if(select_date2 != '')
    {
        if(upDT != 'All')
            upDT += ' ' + select_date2;
        else
            upDT = '~ ' + select_date2;
    }
    document.getElementById('s_date').innerHTML = "上傳時間: " + upDT;
    var useDT = 'All';
    if(select_use_date1 != '')
        useDT = select_use_date1 + ' ~';
    if(select_use_date2 != '')
    {
        if(useDT != 'All')
            useDT += ' ' + select_use_date2;
        else
            useDT = '~ ' + select_use_date2;
    }
    document.getElementById('s_use_date').innerHTML = "使用期間: " + useDT;
    document.getElementById('s_tags').innerHTML = "標籤: " + label_tags;
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
        const tr3 = document.createElement('tr');
        const td5 = document.createElement('td');
        td5.innerHTML = 'Avg. DEF: ' + (bases[i].AvgDEF == null ? 0 : bases[i].AvgDEF);
        td5.colSpan = 2;
        tr3.appendChild(td5);
        tr3.className = 'base_middle';
        const tr2 = document.createElement('tr');
        const td4 = document.createElement('td');
        td4.innerHTML = '上傳時間:' + DateToString(new Date(bases[i].UploadTime));
        td4.colSpan = 2;
        tr2.appendChild(td4);
        tr2.className = 'base_bottom';
        table_base.appendChild(tr);
        table_base.appendChild(tr1);
        table_base.appendChild(tr3);
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
    const use_date1 = document.getElementById('select_use_date1').value;
    const use_date2 = document.getElementById('select_use_date2').value;
    var content = {
        "method": "get_base_detail",
        "data": {
            "BaseID": bases[idx].ID,
            "Max_Cup": Math.max(cup1, cup2),
            "Min_Cup": Math.min(cup1, cup2),
            "Use_Start_Date": use_date1 == '' ? null : use_date1,
            "Use_End_Date": use_date2 == '' ? null : use_date2
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
            "History": [],
            "Tags": []
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
    const s_tags = Array.from(document.getElementById('tags_upd_spelltower').children);
    const o_tags = Array.from(document.getElementById('tags_upd_others').children);
    const oa_tag = document.getElementById('oa_tag');
    oa_tag.innerHTML = '';
    for(var i=0; i<s_tags.length; i++)
        s_tags[i].className = 'label_tags_upd';
    for(var i=0; i<o_tags.length; i++)
        o_tags[i].className = 'label_tags_upd';
    for(var i=0; i<detail.Tags.length; i++)
    {
        const l = document.createElement('label');
        l.innerHTML = detail.Tags[i].TagName;
        l.value = detail.Tags[i].ID;
        l.className = 'oa_tag_l';
        l.addEventListener('click', show_modal_tags_upd);
        oa_tag.appendChild(l);
        var obj = s_tags.find(obj => parseInt(obj.value) == detail.Tags[i].ID);
        if(obj != null)
            obj.className = 'label_tags_upd_selected';
        obj = o_tags.find(obj => parseInt(obj.value) == detail.Tags[i].ID);
        if(obj != null)
            obj.className = 'label_tags_upd_selected';
    }
    if(detail.Tags.length == 0)
    {
        const l = document.createElement('label');
        l.innerHTML = '無標籤';
        l.className = 'oa_tag_l_no';
        l.addEventListener('click', show_modal_tags_upd);
        oa_tag.appendChild(l);
        for(var i=0; i<s_tags.length; i++)
            s_tags[i].className = 'label_tags_upd';
        for(var i=0; i<o_tags.length; i++)
            o_tags[i].className = 'label_tags_upd';
    }

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

function show_modal_tags_upd()
{
    document.getElementById('modal_tags_upd').style.display = 'block';
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

async function modalAddPlayer()
{
    const name = document.getElementById('name_r_add_player').value;
    var tag = document.getElementById('tag_r_add_player').value;
    if(name == '' || tag == '')
        return;
    if(tag.indexOf('#') == 0)
        tag = tag.substring(1, tag.length);

    var content = {
        "method": "add_player",
        "data": {
            "Name": name,
            "Tag": tag
        }
    };
    var result = await fetchPost(apiUrl, content, 'application/json');
    if(result[0] == 200)
        Init();
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
        Init();
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
        const select_legend_person = document.getElementById('select_legend_person');
        select_legend_person.innerHTML = '';
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
            const opt_legend_data = document.createElement('option');
            opt_legend_data.value = result[1][i].Tag;
            opt_legend_data.innerHTML = result[1][i].Name;
            select_legend_person.appendChild(opt_legend_data);
        }
        select_person.dispatchEvent(new Event('change'));
        select_legend_person.dispatchEvent(new Event('change'));
    }
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function closeTagsUpd() {
    const modal = document.getElementById('modal_tags_upd');
    modal.style.display = 'none';
}

function closeAttackedModal()
{
    const modal = document.getElementById('modal_attacked');
    modal.style.display = 'none';
}

function closeLegendData()
{
    const modal = document.getElementById('modal_legend_data');
    modal.style.display = 'none';
}

function closeBaseSelect()
{
    const modal = document.getElementById('modal_base_select');
    modal.style.display = 'none';
    queryBases();
}

function openLegendData()
{
    document.getElementById('select_legend_person').dispatchEvent(new Event('change'));
    const modal = document.getElementById('modal_legend_data');
    modal.style.display = 'block';
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

function tabAddPlayer()
{
    const items = document.querySelectorAll('.modal-add-player');
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
    const tags = document.querySelectorAll('.label_tag_upload_selected');
    var uploadExistedTags = '';
    var uploadNewTags = '';
    var spelltower_tag_count = 0;
    for(var i=0; i<tags.length; i++)
    {
        if(tags[i].value == -1)
            uploadNewTags += (uploadNewTags == '' ? "" : ",") + tags[i].innerHTML + "-" + tag_temp.find(obj => obj.TagName == tags[i].innerHTML).SpellTower;
        else
            uploadExistedTags += (uploadExistedTags == '' ? "" : ",") + tags[i].value;
        if(tags[i].parentNode.id == 'upload_spelltower_tags')
            spelltower_tag_count++;
    }
    if(spelltower_tag_count != 1)
    {
        alert('法術塔標籤需選1個');
        return;
    }
    const formData = new FormData();
    formData.append('file', imageUpload.files[0]);
    formData.append('url', linkUrl);
    formData.append('existedTags', uploadExistedTags);
    formData.append('newTags', uploadNewTags);
    var content = formData;
    var result = await fetchPost(apiUrl + "/upload", content);
    if(result[0] == 200)
        alert('Uploaded');
    else if(result[0] == 405)
    {
        alert(result[2]);
        const baseidx = bases.findIndex(obj => obj.ID == result[1].ID);
        getAndModifyDetail(baseidx);
        document.getElementById('personal_attacked_img_div').style.display = 'none';
        document.getElementById('tabOverAll').dispatchEvent(new Event('click'));
        modal.style.display = 'block';
        modalImage.src = bases[baseidx].Pic;
        modalLink.value = baseidx;
        modalAdd.value = baseidx;
    }
    Init();
}

async function tags_upd_btn_clicked()
{
    const baseIdx = parseInt(document.getElementById('modal-LK').value);
    const selected = document.querySelectorAll('.label_tags_upd_selected');
    const unSelected = document.querySelectorAll('.label_tags_upd');
    var content = {
        "method": "tags_update",
        "data": {
            "BaseID": bases[baseIdx].ID,
            "ExistedTags": [],
            "NewTags": [],
            "UnSelectedTags": []
        }
    };
    for(var i=0; i<unSelected.length; i++)
    {
        if(unSelected[i].value != -1)
            content.data.UnSelectedTags[content.data.UnSelectedTags.length] = unSelected[i].value;
    }
    for(var i=0; i<selected.length; i++)
    {
        if(selected[i].value != -1)
            content.data.ExistedTags[content.data.ExistedTags.length] = selected[i].value;
        else
            content.data.NewTags[content.data.NewTags.length] = selected[i].innerHTML + "-" + tags_upd_tag_temp.find(obj => obj.TagName == selected[i].innerHTML).SpellTower;
    }
    var result = await fetchPost(apiUrl, content, 'application/json');
    if(result[0] == 200)
    {
        await Init();
        await getAndModifyDetail(baseIdx);
        alert('標籤已更新!');
    }
}

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
        if(result[1].InitTrophies != null)
            document.getElementById('cup_r').value = result[1].InitTrophies;
        if(result[1].LossTrophy != null)
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

function add_player_tag_change()
{
    if(this.value.indexOf('#') != 0)
        this.value = '#' + this.value;
}

function show_select_base()
{
    document.getElementById('modal_base_select').style.display = 'block';
}

var assetChart = null;
function DrawChart(data, maxDay)
{
    const days = [];
    const his = [];
    const cur = [];
    const lineColor = ['rgba(68, 68, 68, 0.5)', 'rgba(0, 123, 255, 0.7)'];
    const hoverColor = ['rgba(255, 0, 0, 0.7)', 'rgba(68, 68, 68, 0.3)'];
    const hoverColor1 = ['rgba(0, 213, 255, 1)', 'rgba(0, 255, 213, 0.8)'];

    for(var i=1; i<=maxDay; i++)
    {
        days[days.length] = i;
        his[his.length] = (data[i] == null || data[i][0] == null) ? null : data[i][0];
        cur[cur.length] = (data[i] == null || data[i][1] == null) ? null : data[i][1];
    }

    var ctx = document.getElementById('legend_linechart');
    if(ctx == null)
        return;
	ctx.getContext('2d');
	if(assetChart)
        assetChart.destroy();
    assetChart = new Chart(ctx, {
  		// 參數設定[註1]
  		type: "line", // 圖表類型
  		data: {
  			labels: days, // 標題
  			datasets: [{
  				label: 'Avg', // 標籤
  				data: his, // 資料
  				borderWidth: 2, // 外框寬度
                borderColor: lineColor[0],
                fill: false,
                pointBorderColor: lineColor[0],
                pointBackgroundColor: lineColor[0],
                pointHoverBorderColor: hoverColor[0],
                pointHoverBackgroundColor: hoverColor[1]
  			}, {
                label: '本季', // 標籤
  				data: cur, // 資料
  				borderWidth: 2, // 外框寬度
                borderColor: lineColor[1],
                fill: false,
                pointBorderColor: lineColor[1],
                pointBackgroundColor: lineColor[1],
                pointHoverBorderColor: hoverColor1[0],
                pointHoverBackgroundColor: hoverColor1[1]
            }]
  		},
		options: {
			maintainAspectRatio: false
		}
  	});
}