const current = data.records.filter(
  (i) =>
    i.데이터기준일자.split('-')[0] >= '2023' &&
    i.데이터기준일자.split('-')[1] >= '10' &&
    i.위도 !== ''
);

// 로딩 이미지 구현
const loading = document.querySelector('.loading');

const mapElmt = document.querySelector('#map');

// 검색 버튼 클릭 시 기능 구현
const searchBtn = document.querySelector('.search_engine img');
const searchInput = document.querySelector('.search_engine input');
searchBtn.addEventListener('click', () => {
  const infoWrapper = document.querySelector('.detail_box');
  infoWrapper.style.display = 'none';

  if (searchInput.value === '') {
    alert('검색어를 입력해주세요.');
    searchInput.focus();
    return;
  }

  mapElmt.innerHTML = '';

  const searchInputValue = searchInput.value;
  const searchResult = current.filter(
    (item) =>
      item.도서관명.includes(searchInputValue) ||
      item.시군구명.includes(searchInputValue)
  );

  // console.log(searchResult[0].위도, searchResult[0].경도);
  startLenderLocation(searchResult[0].위도, searchResult[0].경도);
});

function getCurrentLocation() {
  navigator.geolocation.getCurrentPosition(function (position) {
    var lat = position.coords.latitude;
    var lng = position.coords.longitude;
    startLenderLocation(lat, lng); // 첫 화면 로딩 시 내 위치 기준으로 지도 띄우기
  });
}

getCurrentLocation();

function startLenderLocation(lat, lng) {
  var map = new naver.maps.Map('map', {
    center: new naver.maps.LatLng(lat, lng),
    // 잠실 롯데월드를 중심으로 하는 지도. 내 위치 중심으로 바꾸려고 하면 오류 남
    zoom: 13,
  });

  var marker = new naver.maps.Marker({
    position: new naver.maps.LatLng(lat, lng),
    map: map,
  });

  current.forEach((item) => {
    var latLng = new naver.maps.LatLng(item.위도, item.경도);
    var bounds = map.getBounds();

    if (bounds.hasLatLng(latLng)) {
      var marker = new naver.maps.Marker({
        position: latLng,
        map: map,
        title: item.도서관명,
        itemCount: item['자료수(도서)'],
        serialItemCount: item['자료수(연속간행물)'],
        notBookItemCount: item['자료수(비도서)'],
        sitCount: item.열람좌석수,
        wdStart: item.평일운영시작시각,
        wdEnd: item.평일운영종료시각,
        wkStart: item.토요일운영시작시각,
        wkEnd: item.토요일운영종료시각,
        contact: item.도서관전화번호,
        address: item.소재지도로명주소,
        homePage: item.홈페이지주소,
      });

      var infoWindow = new naver.maps.InfoWindow({
        content:
          '<h4 style="padding:.25rem; font-size:14px; font-weight:normal; color:#555;">' +
          item.도서관명 +
          '</h4>',
      });

      loading.style.display = 'none';

      naver.maps.Event.addListener(marker, 'click', function () {
        if (infoWindow.getMap()) {
          infoWindow.close();
        } else {
          infoWindow.open(map, marker);
        }

        const markerData = {
          title: marker.title,
          itemCount: marker.itemCount,
          serialItemCount: marker.serialItemCount,
          notBookItemCount: marker.notBookItemCount,
          siteCount: marker.sitCount,
          wdStart: marker.wdStart,
          wdEnd: marker.wdEnd,
          wkStart: marker.wkStart,
          wkEnd: marker.wkEnd,
          contact: marker.contact,
          address: marker.address,
          homePage: marker.homePage,
        };

        getInfoOnMarker(markerData);
      });
    }
  });

  function getInfoOnMarker(markerData) {
    const infoWrapper = document.querySelector('.detail_box');
    infoWrapper.style.display = 'none';
    infoWrapper.innerHTML = '';

    const {
      title = '미제공',
      itemCount = '미제공',
      serialItemCount = '미제공',
      notBookItemCount = '미제공',
      sitCount = '미제공',
      wdStart = '미제공',
      wdEnd = '미제공',
      wkStart = '미제공',
      wkEnd = '미제공',
      contact = '미제공',
      address = '미제공',
      homePage = '미제공',
    } = markerData;

    console.log(sitCount, title);

    const infoElmt = `
                      <div class="wrapper">
                        <!-- 도서관 이름 -->
                        <header class="title">
                          <h2>${title}</h2>
                          <span class="close">X</span>
                        </header>
                        <!-- 정보 -->
                        <div class="info">
                          <!-- 중요 정보 -->
                          <div class="boxinfo">
                            <div class="red1">
                              <h3>도서</h3>
                              <div class="line"></div>
                              <h3>${itemCount}</h3>
                            </div>
                            <div class="red2">
                              <h3>연속간행물</h3>
                              <div class="line"></div>
                              <h3>${serialItemCount}</h3>
                            </div>
                            <div class="red3">
                              <h3>비도서</h3>
                              <div class="line"></div>
                              <h3>${notBookItemCount}</h3>
                            </div>
                            <div class="blue">
                              <h3>열람좌석수</h3>
                              <div class="line"></div>
                              <h3>${sitCount}</h3>
                            </div>
                          </div>
                          <!-- 기본 정보 -->
                          <div class="letterinfo">
                            <div class="time">
                              <div class="info-title">운영시간 :</div>
                              <div class="info-contents">
                                <p class="weekday">${wdStart} ~ ${wdEnd} (평일)</p>
                                <p class="weekend">${wkStart} ~ ${wkEnd} (토요일 및 공휴일)</p>
                                <p class="msg">* 공휴일 휴관</p>
                              </div>
                            </div>
                            <div class="call">
                              <div class="info-title">연락처 :</div>
                              <div class="info-contents">
                                <p class="call_each">${contact}</p>
                              </div>
                            </div>
                            <div class="address">
                              <div class="info-title">주소 :</div>
                              <div class="info-contents">
                                <p class="address_each">${address}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        <!-- 홈페이지로 이동 -->
                        <div class="link">
                          <a href="${homePage}" class="#">홈페이지로 이동</a>
                        </div>
                      </div>`;

    infoWrapper.insertAdjacentHTML('beforeend', infoElmt);
    infoWrapper.style.display = 'block';
  }
}

document.addEventListener('click', (e) => {
  if (e.target.classList.contains('close')) {
    const infoWrapper = document.querySelector('.detail_box');
    infoWrapper.style.display = 'none';
  }
});
