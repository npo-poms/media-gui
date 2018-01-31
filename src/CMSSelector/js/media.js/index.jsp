<%@page contentType="text/javascript"
%><%-- syntax highlighting to working properly in some editors otherwise...
--%>
window.mediaSelectorDomain = '${pageContext.request.scheme}://${pageContext.request.serverName}${(pageContext.request.serverPort == 80 || pageContext.request.serverPort == 443) ? '' : ':'}${(pageContext.request.serverPort == 80 || pageContext.request.serverPort == 443) ? '' : pageContext.request.serverPort}';
<%@include file="../__media.js" %>
