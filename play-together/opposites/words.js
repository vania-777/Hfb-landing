/* Opposites — every spoken/visible concept text in both languages. One source of truth: the game
   reads it, and the audio clips (audio/<lang>/<key>.mp3) were generated from exactly these strings.
   Keys: word_<pole>, ask_<pair>, yes_<pole>, is_<pole>, sit_<id>, sityes_<id>, plus a few UI lines. */
(function () {
  'use strict';
  window.HFBOppWords = {
    fa: {
      word: { hot: 'داغ', cold: 'سرد', big: 'بزرگ', small: 'کوچیک', day: 'روز', night: 'شب', light: 'روشن', dark: 'تاریک',
        wet: 'خیس', dry: 'خشک', full: 'پُر', empty: 'خالی', open: 'باز', closed: 'بسته', fast: 'تند', slow: 'یواش',
        loud: 'صدای بلند', quiet: 'صدای آروم', up: 'بالا', down: 'پایین', soft: 'نرم', hard: 'سفت' },
      ask: { hotcold: 'داغه یا سرده؟', bigsmall: 'بزرگه یا کوچیکه؟', daynight: 'روزه یا شبه؟', lightdark: 'روشنه یا تاریکه؟',
        wetdry: 'خیسه یا خشکه؟', fullempty: 'پُره یا خالیه؟', openclosed: 'بازه یا بسته‌ست؟', fastslow: 'تنده یا یواشه؟',
        loudquiet: 'صداش بلنده یا آرومه؟', updown: 'می‌ره بالا یا می‌ره پایین؟', softhard: 'نرمه یا سفته؟' },
      yes: { hot: 'آفرین! داغه!', cold: 'آفرین! سرده!', big: 'آفرین! بزرگه!', small: 'آفرین! کوچیکه!', day: 'آفرین! روزه!', night: 'آفرین! شبه!',
        light: 'آفرین! روشنه!', dark: 'آفرین! تاریکه!', wet: 'آفرین! خیسه!', dry: 'آفرین! خشکه!', full: 'آفرین! پُره!', empty: 'آفرین! خالیه!',
        open: 'آفرین! بازه!', closed: 'آفرین! بسته‌ست!', fast: 'آفرین! تنده!', slow: 'آفرین! یواشه!', loud: 'آفرین! صداش بلنده!', quiet: 'آفرین! صداش آرومه!',
        up: 'آفرین! می‌ره بالا!', down: 'آفرین! می‌ره پایین!', soft: 'آفرین! نرمه!', hard: 'آفرین! سفته!' },
      is: { hot: 'این داغه.', cold: 'این سرده.', big: 'این بزرگه.', small: 'این کوچیکه.', day: 'الان روزه.', night: 'الان شبه.',
        light: 'اینجا روشنه.', dark: 'اینجا تاریکه.', wet: 'این خیسه.', dry: 'این خشکه.', full: 'این پُره.', empty: 'این خالیه.',
        open: 'این بازه.', closed: 'این بسته‌ست.', fast: 'این تنده.', slow: 'این یواشه.', loud: 'صدای این بلنده.', quiet: 'صدای این آرومه.',
        up: 'این می‌ره بالا.', down: 'این می‌ره پایین.', soft: 'این نرمه.', hard: 'این سفته.' },
      sit: { cold: 'بررر! خیلی سرده! چی کمک می‌کنه؟', hot: 'اوف! خیلی گرمه! چی کمک می‌کنه؟', wet: 'اِ! زیر بارون خیس شده! چی کمک می‌کنه؟',
        dark: 'اوه! خیلی تاریکه! چی کمک می‌کنه؟', hungry: 'گشنشه! کدوم بشقاب؟', thirsty: 'تشنشه! کدوم لیوان؟',
        baby: 'هیس! نی‌نی خوابه. چی کار کنیم؟', door: 'وقت بازی بیرونه! کدوم در؟' },
      sityes: { cold: 'آفرین! سوپ داغ گرمت می‌کنه!', hot: 'آفرین! بستنی خنکت می‌کنه!', wet: 'آفرین! حولهٔ خشک!', dark: 'آفرین! چراغ روشن شد!',
        hungry: 'آفرین! بشقاب پُر!', thirsty: 'آفرین! لیوان پُر!', baby: 'آفرین! آروم، که نی‌نی بخوابه.', door: 'آفرین! در بازه!' },
      item: { soup: 'سوپ داغ', icecream: 'بستنی', towel: 'حولهٔ خشک', bucket: 'سطل آب', lampOn: 'چراغ روشن', lampOff: 'چراغ خاموش',
        plateFull: 'بشقاب پُر', plateEmpty: 'بشقاب خالی', glassFull: 'لیوان پُر', glassEmpty: 'لیوان خالی', shh: 'هیس، آروم', drum: 'طبل',
        doorOpen: 'در باز', doorClosed: 'در بسته' },
      ui: { try_again: 'یه بار دیگه امتحان کنیم.', level_up: 'آفرین! بریم مرحلهٔ بعد!', celebrate: 'آفرین! پنج ستاره گرفتی!',
        sort_intro: 'هر عکس رو بذار توی جعبهٔ خودش.', sort_done: 'آفرین! همه سر جاشون!' }
    },
    en: {
      word: { hot: 'Hot', cold: 'Cold', big: 'Big', small: 'Small', day: 'Day', night: 'Night', light: 'Light', dark: 'Dark',
        wet: 'Wet', dry: 'Dry', full: 'Full', empty: 'Empty', open: 'Open', closed: 'Closed', fast: 'Fast', slow: 'Slow',
        loud: 'Loud', quiet: 'Quiet', up: 'Up', down: 'Down', soft: 'Soft', hard: 'Hard' },
      ask: { hotcold: 'Hot or cold?', bigsmall: 'Big or small?', daynight: 'Day or night?', lightdark: 'Light or dark?',
        wetdry: 'Wet or dry?', fullempty: 'Full or empty?', openclosed: 'Open or closed?', fastslow: 'Fast or slow?',
        loudquiet: 'Loud or quiet?', updown: 'Up or down?', softhard: 'Soft or hard?' },
      yes: { hot: 'Yes! Hot!', cold: 'Yes! Cold!', big: 'Yes! Big!', small: 'Yes! Small!', day: 'Yes! Day!', night: 'Yes! Night!',
        light: 'Yes! Light!', dark: 'Yes! Dark!', wet: 'Yes! Wet!', dry: 'Yes! Dry!', full: 'Yes! Full!', empty: 'Yes! Empty!',
        open: 'Yes! Open!', closed: 'Yes! Closed!', fast: 'Yes! Fast!', slow: 'Yes! Slow!', loud: 'Yes! Loud!', quiet: 'Yes! Quiet!',
        up: 'Yes! Up!', down: 'Yes! Down!', soft: 'Yes! Soft!', hard: 'Yes! Hard!' },
      is: { hot: 'This one is hot.', cold: 'This one is cold.', big: 'This one is big.', small: 'This one is small.', day: 'It\'s day.', night: 'It\'s night.',
        light: 'It\'s light here.', dark: 'It\'s dark here.', wet: 'This one is wet.', dry: 'This one is dry.', full: 'This one is full.', empty: 'This one is empty.',
        open: 'This one is open.', closed: 'This one is closed.', fast: 'This one is fast.', slow: 'This one is slow.', loud: 'This one is loud.', quiet: 'This one is quiet.',
        up: 'This one goes up.', down: 'This one goes down.', soft: 'This one is soft.', hard: 'This one is hard.' },
      sit: { cold: 'Brrr! It\'s so cold! What helps?', hot: 'Phew! It\'s so hot! What helps?', wet: 'Oh! All wet from the rain! What helps?',
        dark: 'Oh! It\'s too dark! What helps?', hungry: 'So hungry! Which plate?', thirsty: 'So thirsty! Which glass?',
        baby: 'Shh! The baby is sleeping. What do we do?', door: 'Time to go and play outside! Which door?' },
      sityes: { cold: 'Yes! Hot soup warms you up!', hot: 'Yes! Ice cream cools you down!', wet: 'Yes! A dry towel!', dark: 'Yes! The light is on!',
        hungry: 'Yes! A full plate!', thirsty: 'Yes! A full glass!', baby: 'Yes! Quiet, so the baby can sleep.', door: 'Yes! The door is open!' },
      item: { soup: 'Hot soup', icecream: 'Ice cream', towel: 'Dry towel', bucket: 'Bucket of water', lampOn: 'Lamp on', lampOff: 'Lamp off',
        plateFull: 'Full plate', plateEmpty: 'Empty plate', glassFull: 'Full glass', glassEmpty: 'Empty glass', shh: 'Shh, quiet', drum: 'Drum',
        doorOpen: 'Open door', doorClosed: 'Closed door' },
      ui: { try_again: 'Let\'s try again.', level_up: 'Level up! On to the next level!', celebrate: 'Well done! You got five stars!',
        sort_intro: 'Put each picture in its box.', sort_done: 'Yes! All sorted!' }
    }
  };
})();
