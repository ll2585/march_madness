from PIL import Image
for i in range(0,9):
	img = Image.open('{0}.png'.format(i)).convert('LA')
	img.save('{0}_no.png'.format(i))