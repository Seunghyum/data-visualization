export const adrrTranslate:{} = {
  RR: "위험도",
  ad: "초과 사망자수"
} 

export const addUnitToAirPol:{} = {
  PM2_5: "㎍/㎥",
  PM10: "㎍/㎥",
  NO2: "ppm"
}

export function getSearchQueryParam(param:string | null):string | boolean {
  const result = window.location.search.match(
    new RegExp("(\\?|&)" + param + "(\\[\\])?=([^&]*)")
  );
  return result ? result[3] : false;
}
// url control
export function changeLocationSearchParams(k:string | null, v:string | null) {
  if (getSearchQueryParam(k) == false) {
    history.pushState(null, '', window.location.href + (window.location.search == "" ? "?" : "&") + k + "=" + v);
  } else if (getSearchQueryParam(k)) {

    const anotherTopic = (k == "airpol" ? "adrr" : "airpol");

    if (k == "sd") {
      history.pushState(null, '', window.location.origin + window.location.pathname +
        "?sd=" + v
      );
    } else if (k == "sd" || k == "sgg") {
      history.pushState(null, '', window.location.origin + window.location.pathname +
        "?sd=" + getSearchQueryParam("sd") +
        "&sgg=" + v
      );
    } else {
      history.pushState(null, '', window.location.origin + window.location.pathname +
        "?sd=" + getSearchQueryParam("sd") +
        "&sgg=" + getSearchQueryParam("sgg") +
        ("&" + k + "=" + v) +
        (getSearchQueryParam(anotherTopic) == "" ? "" : "&" + anotherTopic + "=" + getSearchQueryParam(anotherTopic))
      );
    }
  }
}