# 2-step-form

## Build Project Environment
Into your terminal, go to the root folder of project, and there run **npm install** to build dependencies<br/>
after that run **php -S localhost:8000 -t app/** to build up local php server<br/>
then go to **http://localhost:8000/** in your web browser<br/>
if you want to rebuild styles and html run **gulp**<br/>

Features:
- responsive (didnt know how to make tabs better for you guys. Have no instructions for that, so i let them be just flex elements with full width on mobile)
- validation happens when user change input field
- phone number validation required only russain mobile numbers with +7 or 8 at the start
- button and tab from first section disabled, until user complete correctly all fields
- button activity from second section depends on delivery option. When delivery is chosen user needs to fill all required inputs correctly to activate button availability. When pickup is chosen, button is avaliable.
