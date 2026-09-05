require('dotenv').config();
const express = require('express');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');

const app = express();
const port = Number(process.env.PORT) || 3000;
const dataPath = path.join(__dirname, 'data.json');

app.use(express.static(__dirname));

async function readStore() {
  return JSON.parse(await fs.readFile(dataPath, 'utf8'));
}

async function writeStore(store) {
  store.cart.updatedAt = new Date().toISOString();
  await fs.writeFile(dataPath, `${JSON.stringify(store, null, 2)}\n`, 'utf8');
}

async function getRazorpayIntegration() {
  const store = await readStore();
  return {
    ...(store.integrations?.razorpay || {}),
    webhookUrl: process.env.RAZORPAY_WEBHOOK_URL || store.integrations?.razorpay?.webhookUrl || null
  };
}

function buildCart(store) {
  const catalog = [...store.products, ...buildCategories(store).flatMap((category) => category.products)];
  const items = store.cart.items.map((item) => {
    const product = catalog.find((entry) => entry.id === item.productId);
    return product ? { ...item, product, lineTotal: product.price * item.quantity } : null;
  }).filter(Boolean);
  return {
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + item.lineTotal, 0),
    delivery: 0,
    total: items.reduce((total, item) => total + item.lineTotal, 0)
  };
}

const categoryNames = ['Birthday', 'Anniversary', 'Wedding', 'Festivals', 'Corporate Gifting', 'For Her', 'For Him'];
const categoryImageAssets = [
  'https://lh3.googleusercontent.com/aida/AEtjO1U2eRRsfJazvySbUc4qGX4Feq9HjiRNwdittCOLJCcfHK7KT5m6Gv3C4vvzB1YhXEHh_Emha3caDXhu0Z1UPwLDe4RkqQ6nDsiuUsVxZ4SWFhxg_Qzh7H7ceeFSebY9wIQe0vatqrIKbdOg6mFjFX-JPHLy45Bvg7Fadl4SsuHSvGPNAgC3ZUev_OuwMWmuFBw80qfrwmklRGC2T6spDVntpuGtOQc1jZHPuWaT3nclmzyhsCcyszeTD9wq=s1200',
  'https://lh3.googleusercontent.com/aida/AEtjO1V1A3bqglxfaxekBR15DPFgfmM6HDTKQkc7jggnLo9iXDIYcbhPDqXFnp4ZofEstFGnF1NF7J3bd3xKKp9aVc0D_zh3M_YxKndD1bYTg3OCFcaMxHvl5lgJ2yqCbwj9tS-JmNo0b08CTDN45RspzC3kl35Ow2oWccGJCwDirSgEjmPiYYj3j5-hXc49w5vrbplOdumxI1N1SbT5CKSkb55tgliw8dheocl-_PZC3kA9U4aAB4USSPI4YaQ=s1200',
  'https://lh3.googleusercontent.com/aida/AEtjO1UHIc1xSdRttLDwqfQ1ES6MQMbVamIH8cUUwZL1Xd6vfbOE3B5YGbN4UF-noJ_zuwoAwjz7W67mt2prA6N4XQYS-TAulbQGQXiF4_hBjMdl6YTgXb5w08BGpkSXKY3kagNBfZEa3e3aKMeqegCJBoiAN65EwLFXQbVZmY0PAlYkH7x1KrMC5spQ6c8ddjhr75i920M1Yw01EUtRVhN7s1pCpxJZrw_uau-CR6RevCW-GBi67CsVMvOmA6gD=s1200',
  'https://lh3.googleusercontent.com/aida/AEtjO1WGsBc4vt301-vsVBv6AwMxQ7G6aQ3OOscJV-86Q-dL5e-kYSbmYKVEunOqcLJy5VHqIR_mq4I8NC-IYI1T25O6LzRTkBwcqinJ-zM2RkSYL3h0le0p1oC0u0GGNrvXpabgiv2SUvqBF7zEaC_jVC4UiGs9uNU9ET282Bi5iElR3iMaECdX6Q_TVJBFR98VDE4uhWhHCtKaE_0NXVHPrL5XJ-qlh6iPXjbN_yLNSpzKJYQWj6GEEpq3ZcGB=s1376',
  'https://lh3.googleusercontent.com/aida/AEtjO1VjEcs87qvoa8bD4_URvvurVPlKnw4nDRzJlToYkImpI1xPj0ppHDXooIdkkhBqV5O3AUnIgRo0rPkd8rfESQVYOM0z8LcOyJkRlVz95AIMzENNquczY6tpKOy-EysaWWdJad8aKwZPOJ3QvWwDFogeskhP_LeHjDTrRqgddL4AfDOLga2FaOvhPzLokXyk59fLkfxj214ILOtApYmiHKTzMdIjr4Xl0Uxv2UvzyYJ1R5TZYKv7Xk1fBS_P=s1376',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB2iVR_70gWJ32q7Lr_Eb2i2H89iQit56zwXe6QP5-eqCxRf8YUvsQmsYEBQpdr_F0gvO2GMjY67fXtijMyx-T5wPQ8WQsVsT6kBVBADDiKN9SFnwMCYJwMldWpHzW9bcY49hdrmEY_4xCvyVoR4Ejwh98e0bY-e1_WTt0NGLx_F3jXWOjH1e_xT7nbmA47QNUPjBYoQuzlCf5x6iADoT6GIrPyQp1-JwcjGrn6tfMZAqDaJt9gp7DHZw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuChn8y1etBcrr38hX_sAO2SMdwT-c6XIrGLdYC8znNYqJB5VpO9ZwYtBW_lEDu54Yrw619iQ3i7DDsj4ugSGUtPDlKjjQNZ934UAR0I1puvBSsCH2CNZZBYk_drdYxin66Pg5kNcXG3TcpucYegTsoH-Q7O3JedBkyMSy87RxykNBhUOmhitCptwE4ZshyVQWszkb6zeyi_P9TkSuSINU4Z7-ZuO4HiFTqOWgd8b8l0xtpSy2Pe2DWuZQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCNqNccI_LkNONElwN4dqLuC4PLJMXi5qao9rfYHtOxXX0xehi5qnPrkSOYEoob7izbb4ZSdsqB4H-f4iAuEFzwafffiEakpQWUPegaBwpA0AIkWJMI-WB2Y8XTMSiCyz1ixLVI2xvCu-i6jq2zeObjK4_af79XJikrRzGRjZh7LYrPd7HwMM1TBrawc4t6IYjx6YQcFMAXsTmD3pUHdABykZ1fJ1JSCZLnNlXvDGocjesHtCNCEqAPQA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC0E1DCJjD7JJTLMT_czM5DL--tq-QxO1VobOhPuHegsDDzpeXaL_2MfOTZCSdMI-MKglKLCUZSDF9qRZd5JYhuM39ZNDlrz1YN9iT1WuXPD0h7JH1BgUcJ03X4UTl_89SQxOdBnjv2Gxixr8yrLxpmWAZN9AsUIdCbLb14aWIP2jVsczo4qn1wl0-K32aHgJlNeYxRSelqnHSZvkCmQ7s1mJjhF7baVZnOsXbRbZjKibLFAlkGa9HBMA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC8A0hPMtM8aaoeonT3zlDY2dnbGE9OWubwMsAt0dAZbexi65jcJMr4j1Sm1p7TGIzuhHGamIYBj3gcorMdXS6k8gqX_0fW_wWKJHmeF1bv9dKVUzKUSjmu-xflexZAg5Ykgv9ITaeiKtINXJiSJH3kdkxLofD4xPiIpe7FDbX2Hh2F5vUW4iRhqy57xVPWwW8AdbACrrVTW558JI7Hjb_w13V-XezHkyfHRExBiW8lsCQ3AspxX69aKA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC9nA932W3v2MtrjjEohxGyxQ1hhwINjFdYEaCB7lacKesmKaNvMoIDJNyDq5FaBI7k0IeXxKNrlW8Ig-p8LjtEmmV_SOdAiX5R3afKGlVvCOwc_DfKcDbMXC-Ee-fb2JrXm-ELclPgupUhbrbaUxY4TU7KRS79D3RBbtQTtfI4LSUE74TxoT7oHYCs9ca4UV0yHg-kwSiP2k-Vkmdsw8IO7hO0X42InVkPFYSh6D44hwRnL6lim3AvOA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC_pEBSWWKB5RFuEFe_8t6ZTVKTUcH59B67UkpmBByhKP2ACVzJBcbMC00JsK4Tya7bSi-dRg9VfmW6mOwVDpaZTHs1J2-q0e5_wxd8aWqh5NesjU66LThdzMRNoPqxNmD718EsWY9eOIApvNl3arxxLMwtPRlfnfiO7hNCL0Kj-X3XpscG7yNwP6y9IRrzbsdJ9IMEVtFTa7fYFBbkEUW7MGcAgOwdMjvn5yf8nfdLPyj6K1zEbS3fRA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDKFAEw60k3aFF6UZdY7wenwbjuFH0LaZqTOqK_vOtvyS01BqoTmVwmtEwKP9CKpwjlO6hL2fhL7d4rFmZwkOiJGkR6iy3Efu71iWnJpxREVdnqFTNlqJfSzYotgjiHCUtLvj1tKi1VgE1lT-qP661gYzwszgLGGUZ50k9hsXxbLoj6TEsL4VJ4XMuXjLiR7KbeXkKZpu928RBG-vEz0RMuWTYmU9C1ewyG2yFmfz5ukZArP6nVTpjnGw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA1blANw3pSvlKkdTMF-JCCxiw1KXnyiF20ytVeQc1NuKs8CXR9t0TQSTdlUhYBb3AQvTDQk25y36Rz4IpnBtmAHPO7QJh8HFX3yDiNRfqmMn3B_X9bpKmB_uuGtqxFeMtDgSS1UasDJk-AmgQTFfopI8kaAeBQRm2xhxvoO6fGKYE_wyzVfjeQASGqSYCJ6FSdUPDIOBE5oiFKxWhgecAhkgiip6rJxZjCGxZyZp7yF75caGFx-8FgHQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB96gGuSJ4VRBfuHniiaWrbaw2qyQFXTvd7cm9fjLd5aOzW2iRiy8_2MKkB075fcEphqBa6NCh5_kaUKfNaSuqPsjPxb2WpZ_gChiec3Kdq0BTAGMOemnai41hsnSqN7Kj32QV18nvvututlWrRTc9GgzO4ZqURINdcka-YOkrZwcdQZMFD5BfUYyersFZyJfme0LmLqUAXJhYSQ09hTS3UY06XQpyEgZlhEj1ZjrHIH9e-CCJW6U7hKQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCPo6-djH-tSRB2U2oanC9T1UAE-_c2339v-zSFHHpddATPc7hw908I9OzreFwkVbB-Q1URGbKs00dfZz9OCpZgy5tlTWica1JsIoPFJkKmq-S8t97mZeCC68c6OSBN_cZal3kGmHyKKEUoku330BntUtl688yMq1meRT_98tt1xsTRjbwCsRyAvz4H2BYPRBcCqD32J4MDQRGEDPdn2F5f9vxeBlGNtnHIvSUvmcWEOGJtqrOh8zxAg',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBY1NlswAOyc6x8DAQuMXO_TnVbwhvYLNIJglq_DA4wIWkYHNWvBtzCQxe39AkxJW4aVhw0bocD0ZDPepk3M8gKMsDSlvNrnycYZfsdKvReJWG2hjBFkR5_m5_32LPZlYfozY0qhdD3UB5ZMq0a_NRjF0T0zOKfvduhD2V0uKn8IVOXkSTaWMXLzPQumPTTaDCub1audd6vNR2WaFM8kX01yW3MJ7Rq77zbcAVtm97C53AN0yf-WZkwiQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBUSHSG9HmIOIHPjhagLfkIyz5TDd_BJd-RuvCnrEFlbxuOEcMUpdAqHUroqzRAV0dTVX0GfHi_MQhNFb39qDNJndFx4CV4kkemczFDZdvOUaVEevpua2omis0CkNhmBbe8lV8GEmJlTjPFyOmDY6Lf4RaY1BSm93uFXPDu09WDpguqRyVwq2-8pQDcfQdC9HQPHXHAFl2stiGhSrx_YsZTKEXJLdK_y8lH5sCku8DRsGhFB-wkSAaldA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA36MII9iZNAPXuSw7GQhkEqB66xNNByYsK40X62NZ-yQ3EvR0j3CDtsJqDnlYGOwsaosxCQCimBHp1S-Z9EWM7_5Iu2mupVazrhkcNmD0N5k57tvDdNExQ_z1n5d2QvxhB7eXOnKYrkYrNzb3TNnM6_uYvfMga65kcNyN_F9-m10phteImDVDxX4pjlgN2Sjplqnlv6NZPkqQ4rZKBW1f5hz1pkbSEX5Wgi9X_Gqi15tntQNEQDocp6g',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuA7237SF_ErQSlQdVYWcJfg4yV4qqgUfIQOKnz1Ejcxf92UdDX9P7VXDhJt70oOFMFBgCq77f9VXxwkWtG5jZRcoEUrLnyIKAHhv_9HDZ7Ui1C4DOBcFWTTg4G4wp_66Mol-onXlajYotogWtCWyfzRHdLO7XTxu_JwDNxQFKFrREvj8kb1YwlCUBKGayqysqhJ2S17X-R26qhEMNleJVZQm9rFlt-EaAstwa4ljlot_CjNP66yNJY40w',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAU9b3cbWGkWrRHntA2Md1nOneRgKbLgQQaKmNRpvadRaOAKv_-VysrGhcivTWwjl-cuv5LybEQ_HR4J8f1VpWiulAtqdoEYjNTcdFZru4UgKJ_kMiaBjUu1WSDldhl-Iqg2kFtubUonlJHmHOqQdckfpK4FnD5J29QCpfJSEHiStt-Vb2bZUBKlWN4m6U43IKV2taQ02_mFeXvbRKVHsV1fw0VUXjlCsWeDtbc9qaHWnOWl40jodyPUg',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBkEx7otmT3_o8e2_Lz6aYT6jcfejsvQ00X4oMk0mEI1NdWou0LC-PLd01Suv0mT4YzwUIrP0g2nBQ3jhh3mS5EtVl4kpgyogwl9Auhnu_XjWlTbJLzltV6ZM8kV2yJLLL9KZPLZaAmoZonrwtkrskoAEYXNCWlwoyTMifbf5bVSb5r-HA7I5egUNFgCkhnNv14QCXGqOwILHnzU4n8xRpp0aIoWXXunP_ds_xHpSzOLXls9iAYqRhcaQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCFCVoo9nCAB0xAzRy5NrckHRmlIrB5bCbecMDheeq3g3dHCwWbQ_R9pLqmV62jTb9Voqs0OVsJV58TPHKc93a8p6Oph_XdITIdNlqPcpeTCDScz25gNozRm1vzB358kzlvL-fKrOtbjgLd9Quwy2C7zPL-oWDw4H0TJ4p3EAg_IoqUiKQlyt3LWvO6fX3WmBNR_GNYpMwYvEaTVhk_MoN4eFNBx1BNdYNF97UP-_1CDQaHH1ggG4g5kw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCI7Ezjq82wUCGCOM__e2WHOi7EWnwbnCvsVQDB6HyvD8ykyQl439DVGAyDlpUuqnmL4lkJj1IT4Gq5Mu5tHjdAP4P44-IwDamvhLzAxQLkAnDLRQSMnQ0RPEAlx2ImG6xckjZhabmh6mkkHvG-dcWbq5v3ELDNQBeIU0pdYGtHbEuLu6OOkxW11x0W6EnBIulgPFTq9bNqdiJj93qox0gv7MPN9sTvCNRkuyhTMUEguU5fCcpH5mw1BA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBPqWT5bN4BweD-rjl_leCt67TQySqaUyQ9AJl0btVqhmV6j9ArjN-52cfkzkwstvXffJ-geU2sFSSMFWV6-xFP6HZokueyAJJYP-wj1_Hh-LxP5fRlNCA-Lb7iq-HuDG6e8fiLMCJ5Yex8Jys-ir4rT37GvJBF8-NXSPWVvpzZ06E_udlNbxn0q-zG2jlm6uj2S4ujuGyavc17qpDR6DGF8jFTgrhDxlCjG94V7gSuheZGJzm5sUKZlg',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDNyn4Y1ABvMyqvZWAo1csgtyOUpUzBG0BIPM6dxplFxk9R_yNau7qCurAfV6MkWiDA31IAUnxqhnzqf7udmxpcDb3U1yCllNZ91Rln7kQSdum8dlFlzT6ZDbm2zHVOAZcMQXyg94Za4D1PEUCipQvUTP_ZinTmihc_dUGho1xuy5f4T-yeLE0hp7iPFCOv8EOAfXVkicCbhYY9UHYL8ENwPBcKK-GvtK193Dr2ZVBBE2jp1akxmaWl7g',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAAIzSS1_w75rSr9dDFmXPSzzMstcT-VAYPAtSQPksOO8vtvBwrzgW-4WWRlxtSBArTEkPSeC7GoswItTDNM6Xuvw3RTnDLuyArZloLZQfEUJ6QC7LBB6Rx4gg1REm2_nhrWEr73n6MHG91BfYXjNnHywdk2H0ckklDNEQca2WDQ3AmmMce1jtDGRPg5yZPRuarHimYNbKr741Yvx1DaJ8j5HZWryJZPJKjjPb_ZvPZi_vduwt9XE5BlA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuADA619XGc3cw6NLoh8uieoocGdy1WXWEoR0sp7skyOhLZAyFDiPJLYC0KL8v6QoB6dnebKtswlrSDz2xji_mXgH5DtWdq2NTHVKO1fh0oWRS-lUuGDvwjRJAAk6bfaGIGJk5thhqpSbPCX9i2R2iVXbOzSerN7y33vVVAGYIpQ4zLUNPBXsNATfJFP-SvX0zeULHEMAFsCeK3eCRBVWqqrz3KNoab_KlFR2K8AzvmJP9dgR9f8V0u-5w',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuByWzMyhI_BdUL0Efbaw57rNnW3rqADO4EnSpX3_yGvMwfdHCCjqGjJjWY2CLpDPtyWqVddZwoUTTUI7UzEEFHOst1vmafQlDNyGLuVe7hchKM7rkMKvlrdr_jFBjsPbWf6tpF_aLUzsCZbqrkubT1PzsQ73Xzq_-lfPi5a-nQXeX16-6Ut540G91M1OM28NJfdhcCEo8atr6XreWkBZuUE-KE8fywbbtcwJ1iDP8Pa3BrxbXQd8JmZ7Q',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB_Dj152YXvJVcueo1PsoM8ypXVazlw3MhS8mam78w7tKJsnRdOwJEBOC_4ngJDuaf-dISzvH363vM39doxprdBTYwgtBwcjcpg2-vGQRK7EhJaqdje24Pxq0ghCjfoQrusBTNnbj44F602W8_bAFjqLaFRQV0_-RIgPdomQeEhIK4v7KnAPX18ICvTTrgUtUz_IlbR4GiLDMt1cobqkusZ2a52e-w2RsWuWk4zZltXoo27lRh_1ngZnQ',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDO-KK0ZBxL7jRrGRZzjtiQKfUPQyvdRrAWkRmtvjHQJk5h-9H5N3h7Ut735VEPAEKmkL7GduUxHQbXtzGJNO2rx40VVITT3kqXnCouZ2bn78dQjPN2h2BaV6M04jNNBrM1zFE6Tf-Iz3Y73GyBoqftlbolxf-vc4SdYKurGD1R9qoNdOQc3hnzjcBc06QEXgrr29kLqtlu5j5cNyl6f1ByJYfzdV7PyV1OzYzqPmTOX60HZXr3fuOIZA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAIh9xYSUun77VAX-jVQk79aoz6XpxsNVjUT0ns-2Vjj2zebbt8vMfx15VBIQLQyiPivfRI8CN90wSXWyU1dAaF98gGcpNiQlIfGL0f8gnP8p6iq4u91cm3YdL_5dLj4ssfZNkIOOIIsT7a_2i2emcgNNP5hsIzYPMw-lgl3KoCAey7ZMsCgZ5f1QEAUpwO3fobPsYBp4oEqmG2wxNP6UooVf73CvzHhaT8PC16FdZQvDvh1kFvn0Sn9g',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDyXqdiKj2LMPxXYUEi4wVs5ldk3RTCb4pE4RYxe6r-bO04tvk7vfCVpuDBDn1844vYWNoth1VqDEyMpQXrZrbPd7NTiC_xXhq_cwSqVNIxBDphdNKT3BuS8ZxBmgr44OAVcBrURU-xtrB5JMmCJBUIT0aa89SeX-QlvV0zaXc0Du0L9ti1ijd5vc-7ablIy9YQ7wXa_sUvKlG-A1RbHssEeryyofzFZHglzeW-IblDx-dsrRyhY3UPEw',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCMndAlRk5Cv7A-FCLWCnLBHi1YyQCtBCoQzKxZpCOs9BUEImi5-lGIOYz7GSIYpfnnM-WwxzWr0gIYeZGOiFH6cdqLZXp7mIE05w0KzMpq5gbzupdswAnufLLt965pGiTNU5uPrUwJqjM92UkJS_DiDjYK8a8DBq6zb5X5yyj2YbVQ9gxSwP4RY5FxJ1N2-Q5zRvqt-O11TFN0d6V9IWqYVAU2j_lKHrT49QJmkdKWU2ROlHNxDvw5JA',
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBTTL8X8QGNygr1VCtZttl4aL1SQhJWhWLg5EzBQJRMb8wIekup3aeIxvH39UBnUqtOcLqripd51ed0FjGdk69LF4qr8P9gZdAjHGDrbWfkg_L2yYRZ7iYWlM0nsfd6TZbKQuNm666ZO-mDPXffUqf1OzN4nyNgNhBejWt5CdcpPgxk0ahpajAvt6ZvXHFmhUMrVsRJCgKC1_ZfArNuV-idJdKha9kohr7FfKKAHVZjh_pdM2KsN0S6lw'
];
const categoryTemplates = [
  ['Signature Treats Box', 'Celebration snacks, artisan chocolate and a handwritten card.', 899],
  ['Curated Comfort Hamper', 'Small-batch delicacies, fragrant tea and a keepsake detail.', 1199],
  ['Golden Hour Gift Set', 'Premium dry fruits, a brass accent and a warm candle.', 1499],
  ['Maker\'s Table Collection', 'Independent-maker favourites presented in a reusable box.', 1699],
  ['Grand Gesture Hamper', 'A generous edit of gourmet treats and lasting keepsakes.', 2199]
];

function buildCategories(store) {
  const uniqueImages = [...new Set(categoryImageAssets)];
  return categoryNames.map((name, categoryIndex) => ({
    id: name.toLowerCase().replaceAll(' ', '-'),
    name,
    products: categoryTemplates.map(([label, description, price], productIndex) => ({
      id: `${name.toLowerCase().replaceAll(' ', '-')}-${productIndex + 1}`,
      name: `${name} ${label}`,
      shortName: `${name} ${label}`,
      tag: productIndex === 0 ? 'Popular' : productIndex === 4 ? 'Signature' : 'Curated',
      price: price + categoryIndex * 50,
      mrp: price + categoryIndex * 50 + 300,
      image: uniqueImages[categoryIndex * categoryTemplates.length + productIndex],
      description,
      rating: 4.7 + ((categoryIndex + productIndex) % 3) / 10,
      reviews: 48 + categoryIndex * 11 + productIndex * 7,
      category: name
    }))
  }));
}

app.get('/api/products', async (_request, response) => {
  const store = await readStore();
  const query = String(_request.query.search || '').trim().toLowerCase();
  const catalog = [...store.products, ...buildCategories(store).flatMap((category) => category.products)];
  response.json(query ? catalog.filter((product) => `${product.name} ${product.description}`.toLowerCase().includes(query)) : catalog);
});

app.get('/api/integrations/razorpay', async (_request, response) => {
  response.json(await getRazorpayIntegration());
});

app.post('/api/razorpay/webhook', express.raw({ type: 'application/json' }), async (request, response) => {
  const signature = request.get('x-razorpay-signature');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (secret && signature) {
    const expected = crypto.createHmac('sha256', secret).update(request.body).digest('hex');
    if (signature !== expected) return response.status(401).json({ error: 'Invalid webhook signature' });
  }
  response.json({ received: true });
});

app.use(express.json());

app.get('/api/products/:id', async (request, response) => {
  const store = await readStore();
  const product = [...store.products, ...buildCategories(store).flatMap((category) => category.products)].find((entry) => entry.id === request.params.id);
  if (!product) return response.status(404).json({ error: 'Product not found' });
  response.json(product);
});

app.get('/api/categories', async (_request, response) => {
  const store = await readStore();
  response.json(buildCategories(store));
});

app.get('/api/cart', async (_request, response) => {
  const store = await readStore();
  response.json(buildCart(store));
});

app.get('/api/favorites', async (_request, response) => {
  const store = await readStore();
  response.json(store.favorites || []);
});

app.post('/api/favorites/:productId', async (request, response) => {
  const store = await readStore();
  const product = [...store.products, ...buildCategories(store).flatMap((category) => category.products)].find((entry) => entry.id === request.params.productId);
  if (!product) return response.status(404).json({ error: 'Product not found' });
  store.favorites = store.favorites || [];
  const index = store.favorites.indexOf(product.id);
  if (index === -1) store.favorites.push(product.id);
  else store.favorites.splice(index, 1);
  await writeStore(store);
  response.json({ productId: product.id, saved: index === -1, favorites: store.favorites });
});

app.get('/api/personalisation', async (_request, response) => {
  const store = await readStore();
  response.json(store.personalisation || { message: '', ribbon: 'Terracotta Raw Silk', occasion: 'Anniversary' });
});

app.put('/api/personalisation', async (request, response) => {
  const { message = '', ribbon = '', occasion = '' } = request.body || {};
  if (String(message).length > 500) return response.status(400).json({ error: 'Gift message must be 500 characters or fewer' });
  const store = await readStore();
  store.personalisation = { message: String(message), ribbon: String(ribbon), occasion: String(occasion), updatedAt: new Date().toISOString() };
  await writeStore(store);
  response.json(store.personalisation);
});

app.post('/api/cart/items', async (request, response) => {
  const { productId, quantity = 1 } = request.body || {};
  const amount = Number(quantity);
  const store = await readStore();
  const product = [...store.products, ...buildCategories(store).flatMap((category) => category.products)].find((entry) => entry.id === productId);
  if (!product) return response.status(404).json({ error: 'Product not found' });
  if (!Number.isInteger(amount) || amount < 1 || amount > 99) return response.status(400).json({ error: 'Quantity must be an integer between 1 and 99' });

  const item = store.cart.items.find((entry) => entry.productId === productId);
  if (item) item.quantity = Math.min(99, item.quantity + amount);
  else store.cart.items.push({ productId, quantity: amount });
  await writeStore(store);
  response.status(201).json(buildCart(store));
});

app.patch('/api/cart/items/:productId', async (request, response) => {
  const amount = Number(request.body?.quantity);
  if (!Number.isInteger(amount) || amount < 1 || amount > 99) return response.status(400).json({ error: 'Quantity must be an integer between 1 and 99' });
  const store = await readStore();
  const item = store.cart.items.find((entry) => entry.productId === request.params.productId);
  if (!item) return response.status(404).json({ error: 'Cart item not found' });
  item.quantity = amount;
  await writeStore(store);
  response.json(buildCart(store));
});

app.delete('/api/cart/items/:productId', async (request, response) => {
  const store = await readStore();
  const before = store.cart.items.length;
  store.cart.items = store.cart.items.filter((entry) => entry.productId !== request.params.productId);
  if (store.cart.items.length === before) return response.status(404).json({ error: 'Cart item not found' });
  await writeStore(store);
  response.json(buildCart(store));
});

app.delete('/api/cart', async (_request, response) => {
  const store = await readStore();
  store.cart.items = [];
  await writeStore(store);
  response.json(buildCart(store));
});

app.post('/api/orders', async (request, response) => {
  const store = await readStore();
  const cart = buildCart(store);
  if (!cart.items.length) return response.status(400).json({ error: 'Your cart is empty' });
  const customer = request.body?.customer || {};
  if (!customer.name || !customer.phone || !customer.address) return response.status(400).json({ error: 'Name, phone and address are required' });
  const paymentMethod = String(request.body?.paymentMethod || 'cod');
  if (!['cod', 'upi', 'card', 'netbanking'].includes(paymentMethod)) return response.status(400).json({ error: 'Choose a valid payment method' });

  const order = {
    id: `BND-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    createdAt: new Date().toISOString(),
    status: 'confirmed',
    customer: { name: customer.name, phone: customer.phone, address: customer.address },
    paymentMethod,
    items: cart.items.map(({ product, quantity, lineTotal }) => ({ productId: product.id, name: product.name, quantity, lineTotal })),
    total: cart.total
  };
  store.orders.push(order);
  store.cart.items = [];
  await writeStore(store);
  response.status(201).json({ order, cart: buildCart(store) });
});

app.use((error, _request, response, _next) => {
  console.error(error);
  response.status(500).json({ error: 'Something went wrong on the server' });
});

app.listen(port, () => {
  console.log(`Bandhan & Co. running at http://localhost:${port}`);
});
