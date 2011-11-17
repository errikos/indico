{
    vidyoComponents : null,
    loaded: {
        session: false,
        contribution: false
    },

    start : function(booking, iframeElement) {
        window.open(booking.url);
    },

    checkStart : function(booking) {
        booking.permissionToStart = true;
        return true;
    },

    checkConnect : function(booking) {
        booking.permissionToConnect = true;
        return true;
    },

    checkParams: function() {
        var self = this;
        return {
            'roomName' : ['text', false, function(name, values){
                var maxNameLength = ${ MaxNameLength };
                var errors = [];
                if (name.length > maxNameLength) {
                    errors.push($T("The room name cannot be longer than ") + maxNameLength + $T(" characters."));
                }
                return errors;
            }],
            'roomDescription' : ['text', false],
            'pin': ['non_negative_int', true],
            'videoLinkSession': ['text', false, function(option, values){
                var errors = [];
                if(self.vidyoComponents["link"].get()=="session" && option == "None"){
                    errors.push($T("No session has been defined."));
                }
                return errors;
            }],
            'videoLinkContribution': ['text', false, function(option, values){
                var errors = [];
                if(self.vidyoComponents["link"].get()=="contribution" && option == "None"){
                    errors.push($T("No contribution has been defined."));
                }
                return errors;
            }]
        };
    },

    errorHandler: function(event, error, booking) {
        if (event === 'create' || event === 'edit') {
            if (error.errorType === 'invalidName') {
                var message = $T("That room name is not valid. Please write a new name that starts " +
                                 "with a letter or a number, and does not contain punctuation, except periods, underscores or dashes. " +
                                 "Unicode characters are allowed (é, ñ, 漢字) but some may cause problems.");
                IndicoUtil.markInvalidField($E('roomName'), message);
            }

            if (error.errorType === 'invalidDescription') {
                var message = $T("That room description is not valid. Maybe an Unicode character is causing a problem.");
                IndicoUtil.markInvalidField($E('roomDescription'), message);
            }

            if (error.errorType === 'nameTooLong') {
                var message = $T("The room name cannot be longer than ") + ${ MaxNameLength } + $T(" characters.");
                IndicoUtil.markInvalidField($E('roomName'), message);
            }

            if (error.errorType === 'duplicated') {
                // the name is duplicated
                var message = $T("There is already a Vidyo Public Room in this event with the same name. Please give a different name to the room.");
                IndicoUtil.markInvalidField($E('roomName'), message);

            }

            if (error.errorType === 'badOwner') {
                CSErrorPopup($T("Invalid owner"), [$T("The user ") + this.vidyoComponents["ownerField"].get().name + $T(" does not have a Vidyo account.")]);
            }

            if (error.errorType === 'userHasNoAccounts') {
                CSErrorPopup($T("Invalid owner"), [$T("The user ") + this.vidyoComponents["ownerField"].get().name + $T(" does not have an account in Indico.")]);
            }
            if (error.errorType === 'sessionNotDefined') {
                CSErrorPopup($T("No session defined"), [$T("A session must be set.")]);
            }
            if (error.errorType === 'contributionNotDefined') {
                CSErrorPopup($T("Invalid owner"), [$T("A contribution must be set.")]);
            }
        }

        if (event === 'edit' && error.errorType === 'unknownRoom') {
            vidyoMarkBookingNotPresent(booking);
            CSErrorPopup($T("Public room removed in Vidyo"),
                    [$T("This public room seems to have been deleted in Vidyo."),
                     $T("Please delete it and try to create it again.")]);
        }

        if (event === 'checkStatus' && error.errorType === 'unknownRoom') {
            vidyoMarkBookingNotPresent(booking);
            CSErrorPopup($T("Public room removed in Vidyo"),
                    [$T("This public room seems to have been deleted in Vidyo."),
                     $T("Please delete it and try to create it again.")]);

        }

        if (event === 'connect' && error.errorType === 'noValidConferenceRoom') {
            CSErrorPopup($T("Not valid conference room"),
                    [$T("The conference room is not a valid Vidyo capable room."),
                     $T("Please select one that is Vidyo capable.")]);

        }

        if (event === 'connect' && error.errorType === 'unknownRoom') {
            CSErrorPopup($T("Public room removed from Vidyo"),
                    [$T("This public room seems to have been deleted from Vidyo."),
                     $T("Please delete it and try to create it again.")]);
        }
        if (event === 'connect' && error.errorType === 'connectFailed') {
            CSErrorPopup($T("Connect room failed"),[error.userMessage]);
        }
    },

    customText: function(booking) {
        if (!booking.error) {
            return $T("Extension: ") + booking.extension;
        } else {
            return '';
        }
    },

    showInfo : function(booking) {
        var infoTbody = Html.tbody();

        if (booking.error && booking.errorDetails) {
            var errorCell = Html.td({colspan:2, colSpan:2});
            errorCell.append(Html.span('collaborationWarning', booking.errorDetails));
            infoTbody.append(Html.tr({}, errorCell));
        }

        infoTbody.append(Html.tr({},
            Html.td("collaborationInfoLeftCol", $T('Room name:')),
            Html.td({}, booking.bookingParams.roomName)));

        infoTbody.append(Html.tr({},
            Html.td("collaborationInfoLeftCol", $T('Extension:')),
            Html.td({}, booking.extension)));

        infoTbody.append(Html.tr({},
            Html.td("collaborationInfoLeftCol", $T('Room owner:')),
            Html.td({}, booking.bookingParams.owner.name)));

        var pinInfo;
        if (booking.bookingParams.hasPin) {
            pinInfo = new HiddenText(booking.bookingParams.pin, Html.span("VidyoHiddenPIN", "********"), false).draw();
        } else {
            pinInfo = $T("No PIN was defined");
        }

        infoTbody.append(Html.tr({},
            Html.td("collaborationInfoLeftCol", $T('PIN:')),
            Html.td({}, pinInfo)));

        infoTbody.append(Html.tr({},
            Html.td("collaborationInfoLeftCol", $T('Description:')),
            Html.td({}, booking.bookingParams.roomDescription)));

        infoTbody.append(Html.tr({},
                Html.td("collaborationInfoLeftCol", $T('Auto-join URL:')),
                Html.td({}, booking.url ? Html.a({href:booking.url}, booking.url) : $T("not assigned yet"))));

        infoTbody.append(Html.tr({},
            Html.td("collaborationInfoLeftCol", $T('Visibility:')),
            Html.td({}, booking.bookingParams.hidden? $T("Hidden") : $T("Visible"))));

        infoTbody.append(Html.tr({},
            Html.td("collaborationInfoLeftCol", $T('Created on:')),
            Html.td({}, formatDateTimeCS(booking.creationDate))));

        infoTbody.append(Html.tr({},
            Html.td("collaborationInfoLeftCol", $T('Last modified on:')),
            Html.td({}, formatDateTimeCS(booking.modificationDate))));

        infoTbody.append(Html.tr({},
            Html.td("collaborationInfoLeftCol", $T('Linked to:')),
            Html.td({}, booking.linkVideoText)));

        return Html.div({}, Html.table({}, infoTbody));
    },

    observeRadioButtons: function(vidyoComponents) {
        var self = this;

        vidyoComponents["link"].observe(function(value){
            switch(value) {
            case"session":
                if (vidyoComponents["changed"] == false) {
                    vidyoComponents["dummy"] = $('#videoEventLinkSelection').html();
                    vidyoComponents["changed"] = true;
                }
                if(self.loaded["session"] === true && vidyoComponents["session"]){
                    $E('videoEventLinkSelection').set(vidyoComponents["session"].draw());
                }else{
                    $E('videoEventLinkSelection').set(progressIndicator(true, true));
                }
                break;
            case"contribution":
                if (vidyoComponents["changed"] == false) {
                    vidyoComponents["dummy"] = $('#videoEventLinkSelection').html();
                    vidyoComponents["changed"] = true;
                }
                if(self.loaded["contribution"] === true && vidyoComponents["contribution"]){
                    $E('videoEventLinkSelection').set(vidyoComponents["contribution"].draw());
                }else{
                    $E('videoEventLinkSelection').set(progressIndicator(true, true));
                }

                break;
            case"None":
            default:
                if (vidyoComponents["changed"]) {
                    $('#videoEventLinkSelection').html(vidyoComponents["dummy"]);
                }
                break;
            }
        });
    },

    getVidyoComponents : function(ajaxPending) {
        var self = this;
        var params = {conference : confId};

        self.vidyoComponents = {
            params : params,
            ownerField : new SingleUserField(${ jsonEncode(LoggedInUser) },
                'owner',
                true, true, null,
                null, false,
                false, false,
                singleUserNothing, singleUserNothing),
            pinField : new ShowablePasswordField('pin', '', false),
            link : new RadioFieldWidget([
                 ['event', $T("Leave default Vidyo association")],
                 ['contribution', $T("Link to a contribution")],
                 ['session', $T("Link to a session")]
             ], 'nobulletsListInline','videoLinkType'),
            session :new SelectRemoteWidget('event.sessions.listAll',
                params, function() {
                        ajaxPending["session"].resolve();
                }, 'videoLinkSession', "No sessions"),
            contribution : new SelectRemoteWidget('event.contributions.listAll',
                params, function() {
                        ajaxPending["contribution"].resolve();
                }, 'videoLinkContribution', "No contributions"),
            dummy : "",
            changed : false
        };

        return self.vidyoComponents;
    },

    addComponents: function(bookingPopup){
        var self = this;
        self.loaded["session"] = false;
        self.loaded["contribution"] = false;
        ajaxPending= {
            session : $.Deferred(),
            contribution : $.Deferred()
        };

        var vidyoComponents = self.getVidyoComponents(ajaxPending);

        $E('owner').set(vidyoComponents["ownerField"].draw());
        $E('PINField').set(vidyoComponents["pinField"].draw());
        $E('videoEventLinkType').set(vidyoComponents["link"].draw());

        bookingPopup.addComponent(vidyoComponents["ownerField"]);
        bookingPopup.addComponent(vidyoComponents["pinField"]);
        bookingPopup.addComponent(vidyoComponents["session"]);
        bookingPopup.addComponent(vidyoComponents["contribution"]);
        bookingPopup.addComponent(vidyoComponents["link"]); /* This must be the last component added. */
        vidyoDrawContextHelpIcons(vidyoComponents["pinField"]);

        $.when(ajaxPending["session"]).done(function() {
            if(vidyoComponents["link"].get() == "session"){
                $E('videoEventLinkSelection').set(vidyoComponents["session"].draw());
            }
            self.loaded["session"] = true;
        });

        $.when(ajaxPending["contribution"]).done(function() {
            if(vidyoComponents["link"].get() == "contribution"){
                $E('videoEventLinkSelection').set(vidyoComponents["contribution"].draw());
            }
            self.loaded["contribution"] = true;
        });

        self.observeRadioButtons(vidyoComponents);

        return vidyoComponents;
    },

    onCreate: function(bookingPopup) {
        var vidyoComponents = this.addComponents(bookingPopup);
        vidyoComponents["link"].select('event');

    },

    onEdit: function(booking, bookingPopup) {
        this.addComponents(bookingPopup);
    },

    beforeCreate: function(pluginName, conferenceId) {
        return true;
    },

    postCreate: function(booking) {
    },

    postEdit: function(booking) {
    },

    postCheckStatus: function(booking) {
        if (booking.warning) {
            if (booking.warning === 'invalidName') {
                var popup = new AlertPopup($T("Problem retrieving the room name"),
                        Html.span({}, $T("The room name could not be decoded and updated in Indico."),
                                      Html.br(),
                                      $T("Maybe it contains some Unicode characters that Indico is not able to handle.")));
                popup.open();
            }
            if (booking.warning === 'invalidDescription') {
                var popup = new AlertPopup($T("Problem retrieving the description text"),
                        Html.span({}, $T("The description text could not be decoded and updated in Indico."),
                                      Html.br(),
                                      $T("Maybe it contains some Unicode characters that Indico is not able to handle.")));
                popup.open();
            }
        }
    },

    postDelete: function(booking) {
        if (booking.warning) {
            if (booking.warning === 'cannotDeleteNonExistant') {
                var popup = new AlertPopup($T("Public room deletion"),
                        Html.span({}, $T("The public room was deleted successfully from Indico."),
                                      Html.br(),
                                      $T("However, please note that the public room had already been removed from the Vidyo system previously.")));
                popup.open();
            }
        }
    }
}

