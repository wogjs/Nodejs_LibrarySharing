<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<%
	//response.sendRedirect("web/main/main.jsp");
%>
<%
	//로그인 세션 관리
	String userID = null;
	if (session.getAttribute("userID") != null) {
		userID = (String) session.getAttribute("userID");
	}
%>

<!------------------------HEADER INCLUDE------------------------>
<%@ include file="../../web/main/header.jsp" %>
<!------------------------HEADER INCLUDE------------------------>
	
<!------------------------★임시내용------------------------>

<div class="wrapper">
	<div class="container fp-divfloat fp-container fp-divfloatcenter" >
			<table class="table table-bordered table-hover" style="text-align: center; width:300px;border: none">
				<thead>
					<tr>
						<th><h4>myPage 위치</h4></th>
					</tr>
				</thead>
			</table>
	</div>
</div>
<!------------------------★임시내용------------------------>

<!------------------------MODAL INCLUDE------------------------>
<%@ include file="../../web/main/modal.jsp" %>
<!------------------------MODAL INCLUDE------------------------>

<!------------------------FOOTER INCLUDE------------------------>
<%@ include file="../../web/main/footer.jsp" %>
<!------------------------FOOTER INCLUDE------------------------>