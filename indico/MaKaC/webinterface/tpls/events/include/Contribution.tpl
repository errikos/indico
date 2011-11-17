<%page args="item, parent, minutes=False, hideEndTime=False, timeClass='topLevelTime',
     titleClass='topLevelTitle', abstractClass='topLevelAbstract', scListClass='topLevelSCList'"/>

<%namespace name="common" file="Common.tpl"/>

<li class="meetingContrib">
        <%include file="ManageButton.tpl" args="item=item, alignRight=True"/>

    <span class="${timeClass}">
        ${getTime(item.getAdjustedStartDate(timezone))}
        % if not hideEndTime:
            - ${getTime(item.getAdjustedEndDate(timezone))}
        % endif
    </span>

    <span class="confModifPadding">
        <span class="${titleClass}">${item.getTitle()}</span>

        % if item.getDuration():
            <em>${prettyDuration(item.getDuration())}</em>\
        % endif
        % if getLocationInfo(item) != getLocationInfo(parent):
            <span style="margin-left: 15px;">\
            (${common.renderLocation(item, parent=parent, span='span')})
            </span>
        % endif
        % if conf.getCSBookingManager().hasVideoService(item.getUniqueId()):
            % for video in conf.getCSBookingManager().getVideoServicesById(item.getUniqueId()):
                <%include file="VideoService.tpl" args="video=video, videoId=item.getUniqueId()"/>
            % endfor
        % endif
    </span>

    % if item.getDescription():
        <br /><span class="description">${common.renderDescription(item.getDescription())}</span>
    % endif

    <table class="sessionDetails">
        <tbody>
        % if item.getSpeakerList() or item.getSpeakerText():
        <tr>
            <td class="leftCol">Speaker${'s' if len(item.getSpeakerList()) > 1 else ''}:</td>
            <td>${common.renderUsers(item.getSpeakerList(), unformatted=item.getSpeakerText())}</td>
        </tr>
        % endif

        % if item.getReportNumberHolder().listReportNumbers():
            (${ ' '.join([rn[1] for rn in item.getReportNumberHolder().listReportNumbers()])})
        % endif

        % if len(item.getAllMaterialList()) > 0:
        <tr>
            <td class="leftCol">Material:</td>
            <td>
            % for material in item.getAllMaterialList():
                % if material.canView(accessWrapper):
                <%include file="Material.tpl" args="material=material, contribId=item.getId()"/>
                % endif
            % endfor
            </td>
        </tr>
        % endif
    </table>

    % if minutes:
        <% minutesText = item.getMinutes().getText() if item.getMinutes() else None %>
        % if minutesText:
            <div class="minutesTable">
                <h2>${_("Minutes")}</h2>
                <span>${common.renderDescription(minutesText)}</span>
            </div>
        % endif
    % endif

    % if item.getSubContributionList():
    <ul class="${scListClass}">
        % for subcont in item.getSubContributionList():
            <%include file="SubContribution.tpl" args="item=subcont, minutes=minutes"/>
        % endfor
    </ul>
    % endif
</li>