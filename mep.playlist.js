/*!
 * MediaElementPlayer Playlist plugin
 * @author Kenneth Pierce
 */
(function($) {
	$.extend(mejs.MepDefaults,{
		playlist:[],
		playlistHandleHeightFixed:false,
		playlistFetchID3:false,
		playlistID3Format:'%artist% - %title%',
		playlistID3Script:'/id3.php',
		audioPosters:false});
	MediaElementPlayer.prototype.buildplaylist=function(p,c,l,m){
		var o=p.options;
		if(o.playlist.length==0) return;
		var playlist=$('<div class="mejs-playlist">Loading...</div>'),
			list=$('<ol/>');
		if(o.audioPosters){
			l.append('<img src="'+o.playlist[0][0]+'.jpg" alt="" class="mejs-audio-poster" />');
		}
		if(!p.isVideo && o.playlistFetchID3)
			p.xgetID3(p,o,m,playlist,list);
		else{
			for(var i=0;i<o.playlist.length;i++) {
				list.append(p.makeplaylistitem(p,m,i));
			}
			list.children().first().addClass('mejs-playlist-item-active');
			if(p.options.currentlyplayingele)
				p.options.currentlyplayingele.html(list.children().first().html());
			playlist.empty().append(list);
			playlist.css('cursor','pointer');
			SimpleScroller.wrapInScroller(list,{ handleHeightFixed: o.playlistHandleHeightFixed });
		}
		l.append(playlist);
	};
	MediaElementPlayer.prototype.makeplaylistitem=function(p,m,idx) {//function needed only to localize the value of the current index
		var entry=p.options.playlist[idx],item;
		if(!entry.pop){
			entry=[entry];
		}
		if(entry.length==1)
			item=$('<li class="mejs-playlist-item">'+entry[0]+'</li>');
		else
			item=$('<li class="mejs-playlist-item">'+entry[1]+'</li>');
		item.click(function(){
			p.pause();
			if(p.isVideo){
				p.setPoster(entry[0]+'.jpg');
				if(m.canPlayType('video/mp4'))
					p.setSrc(entry[0]+'.mp4');
				else if(m.canPlayType('video/ogg'))
					p.setSrc(entry[0]+'.ogg');
				else if(m.canPlayType('video/webm'))
					p.setSrc(entry[0]+'.webm');
			}else{
				if(p.options.audioPosters)
					p.layers.find('.mejs-audio-poster').attr('src',entry[0]+'.jpg');
				if(m.canPlayType('audio/mpeg'))
					p.setSrc(entry[0]+'.mp3');
				else if(m.canPlayType('audio/ogg'))
					p.setSrc(entry[0]+'.ogg');
			}
			p.load();
			item.addClass('mejs-playlist-item-active');
			if(p.options.currentlyplayingele)
				p.options.currentlyplayingele.html(item.html());
			item.siblings().removeClass('mejs-playlist-item-active');
			var ftmp=function() {
				p.media.removeEventListener('loadeddata',ftmp);
				p.play();
			};
			p.media.addEventListener('loadeddata',ftmp,false);
		});
		return item;
	};
	MediaElementPlayer.prototype.buildnext=function(p,c,l,m) {
		$('<div class="mejs-button mejs-playlist-next"><button type="button"></button></div>').appendTo(c).click(function() {
			p.find('.mejs-playlist-item-active').next().click();
		});
	};
	MediaElementPlayer.prototype.buildprevious=function(p,c,l,m) {
		$('<div class="mejs-button mejs-playlist-previous"><button type="button"></button></div>').appendTo(c).click(function() {
			p.find('.mejs-playlist-item-active').prev().click();
		});
	};
	MediaElementPlayer.prototype.buildcurrentlyplaying=function(p,c,l,m) {
		p.options.currentlyplayingele=$('<div scrollamount="1" behavior="alternate" direction="right" class="mejs-currently-playing">&nbsp;</div>"').appendTo(c).marquee('mejs-currently-playing').children().first();
	};
	MediaElementPlayer.prototype.xgetID3=function(p,o,m,playlist,list) {
		var obj=ArrayToObject(o.playlist);
		obj.fields=p.options.playlistID3Format.match(/%[^%]+%/g).join();
		$.ajax({
			url: p.options.playlistID3Script,
			data: obj
		}).success(function(doc) {
			$(doc).find('item').each(function(ix,item) {
				item=$(item);//TODO: rewrite to use the array approach and extentionless
				var oitem=[],ide=item.find('id'),idx=parseInt(ide.text()),display=p.options.playlistID3Format;
				oitem[0]=o.playlist[idx];
				ide.siblings().each(function(index,item){
					item=$(item);
					re=new RegExp('%'+item[0].tagName+'%');
					display=display.replace(re,item.text());
				});
				oitem[1]=display;
				o.playlist[idx]=oitem;
			});
			for(var i=0;i<o.playlist.length;i++) {
				list.append(p.makeplaylistitem(p,m,i));
			}
			list.children().first().addClass('mejs-playlist-item-active');
			if(p.options.currentlyplayingele)
				p.options.currentlyplayingele.html(list.children().first().html());
			playlist.empty().append(list);
			playlist.css('cursor','pointer');
			SimpleScroller.wrapInScroller(list,{ handleHeightFixed: o.playlistHandleHeightFixed });
		});
		return o;
	};
})(jQuery);
function ArrayToObject(a){var c=new Object();for(var b=0;b<a.length;b++){c[""+b]=a[b]+".mp3"}return c};