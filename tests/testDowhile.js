// inline comment
/*
block comment

*/

/* block comment inline */
/*let i = 1;
do {
    print(i);
    i = i + 1;
} while (i <= 3);
print('done');

while (i <= 8) {
    print(i);
    i = i + 1;
}*/
const t = 3;
for (let index = 0; index <= 4; index = index + 1) {
    if (index == 1) {
        continue;
    }

    if (index == 3) {
        break;
    }

    print(index);
}