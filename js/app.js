var app = {

	html : null,

	limit: 9,

	langs : {
		en: 'English',
		zh: 'Chinese',
		ja: 'Japanese',
		ko: 'Korean',
		es: 'Spanish',
		ru: 'Russian',
	    fr: 'French',
	    de: 'German',
		pl: 'Polish',
		// pt: 'Portuguese',
		// it: 'Italian',
		// sv: 'Sweddish',
		// no: 'Norweiagan',
		// da: 'Danish',
		// nl: 'Dutch',
		// fi: 'Finnish',
		// tr: 'Turkish',
		// cs: 'Czecs',
		// sk: 'Slovak',
		// hu: 'Hungarian'
	},

	filters: {
		langsSelected: [],
		gameSelected: null
	},

	events: function() {
		var $body = $('body');
		var $noOverlay = $('.no-overlay');

		// show/hide language filter
		$('.menu-toggle').bind('click', function() {
			if ( $body.hasClass('menu-open') ) {
				console.log('go filter!');
				app.filterByLanguage();
			}
			$body.toggleClass('menu-open');
			return false;
		});
		$( "#openclose" ).click(function() {
			$( ".menu-toggle" ).toggleClass( "menu-toggle-close", 1000 );
			$noOverlay.toggleClass('overlay', 2000);
		});

		// show/hide game filter
		$('.menu-toggle-right').bind('click', function() {
			$body.toggleClass('menu-open-right');
			return false;
		});
		$('#openclose-right').bind('click', function() {
			$noOverlay.toggleClass('overlay');
			$( ".menu-toggle-right" ).toggleClass( "menu-toggle-right-close", 1000 );
			return false;
		});

		// set filter to game
		$('.menu-side-right').on('click', '.game-picker a', function(e){
			e.preventDefault();
			var game = $(this).html();
			app.filters.gameSelected = game;
			app.getData('game', game);
			$('#openclose-right').click();
		});

		// show twitch stream
		$('#container').on('click', '.stream-box-inner', function(e){
			var channel = $(this).data('name');
			console.log('show stream! ' + channel);
			$('#video-pop iframe').attr('src', 'http://player.twitch.tv/?channel=' + channel);
			$('#video-pop').show();
		});

		// close twitch stream
		$('#video-pop').on('click', '.close-video', function(e){
			e.preventDefault();
			$('#video-pop iframe').attr('src', '');
			$('#video-pop').hide();
		});

		// load more streams
		$('body').on('click', '#loadMore', function(e){
			app.getNext();
		});
	},

	init: function() {
		// bind events
		app.events();
		// get initial twitch data
		app.getData();
		// render languages list filter
		app.render(app.langs,"#languages",".menu-side", "clean");

	},
	show: function(streams, type) {
		// render stream tiles
		app.render(streams, "#streams", "#container", type);
		$('#loadMore').show();
	},

	getData: function() {
		var url = "https://api.twitch.tv/kraken/streams?limit=" + app.limit;

		// if language filter is on add to url
		app.filters.langsSelected.forEach( function(lang) {
			url += '&broadcaster_language=' + lang;
		});
		// if game filter is on add to url
		if ( app.filters.gameSelected ) {
			url += '&game=' + app.filters.gameSelected;
		}
		// get twitch streams
		$.get( url, function( data ) {
			console.log('streams', data);
			if (!data.streams.length) {
				app.updateMoreStreamsBtn(false);
			}
			else { app.updateMoreStreamsBtn(true); }
			app.urlNext = data._links.next;
			app.show( data.streams, 'clean');
		});
		// get and render top 20 games for game filter selector
		$.get( 'https://api.twitch.tv/kraken/games/top?limit=20', function( gamesTop ) {
			console.log('gamesTop, ', gamesTop);
			app.render(gamesTop.top,"#games",".menu-side-right", "clean");
		});
	},

	getNext: function() {
		// load and render more stream tiles
		$.get( app.urlNext, function( data ) {
			console.log('more!', data);
			if (!data.streams.length) {
				app.updateMoreStreamsBtn(false);
			}
			else { app.updateMoreStreamsBtn(true); }
			app.urlNext = data._links.next;
			app.show( data.streams, 'append');
		});
	},

	filterByLanguage: function() {
		// check for language filter and load twitch data
		langsSelected = [];
		$('.menu-side input:checked').each(function(i, item) {
			langsSelected.push(item.id);
		});
		app.filters.langsSelected = langsSelected;
		app.getData();
	},

	getDateFormat: function(dateString) {
		// format date
		var date = new Date(dateString).toDateString().slice(4).split(' ');
		return date[0] + ' ' + date[1] +', ' + date[2];
	},

	updateMoreStreamsBtn: function(hasData) {
		console.log('aaaa');
		$btn = $('#loadMore');
		if (hasData) {
			$btn.attr('disabled', false).html('Load more');
		}
		else {
			$btn.attr('disabled', true).html('No more streams...');
		}
	},

	//render: function ( data, whatTemplate, where, how ) 
	render: function ( data, templateId, where, method ) {

		var $el = $(templateId),
			temp = $el.html(),
			render = Handlebars.compile(temp),
			html = render(data);

		switch (method)
		{
			case "clean":
				$(where)
					.empty()
					.append(html);
					break;
			case "append":
				$(where)
					.append(html);
					break;
			case "prepend":
				$(where)
					.prepend(html);
					break;
			case 'html':
				return html;
			default:
			console.log("wrong or no case method from called function");
		}
	},
};

// init handlebars date format helper 
Handlebars.registerHelper('dateFormat', function ( date ) {
	return app.getDateFormat(date);
});

app.init();