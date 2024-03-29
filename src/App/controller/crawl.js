const fs = require("fs");
const axios = require("axios");
const cheerio = require("cheerio");
const path = require("path");
const util = require("util");
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

class crawl {
  async crawlData(req, res) {
    const url = "https://poynting.tech/antennas/?v=e14da64a5617";
    // Sử dụng Axios để tải nội dung của trang web
    axios
      .get(url)
      .then((response) => {
        // Kiểm tra xem trang web có được tải thành công không
        if (response.status === 200) {
          // Sử dụng Cheerio để phân tích cú pháp HTML
          const $ = cheerio.load(response.data);

          // Truy xuất vào thẻ ul và lấy toàn bộ nội dung
          const ulContent = $("ul.products.columns-4");

          // Mảng để lưu trữ thông tin sản phẩm
          const productsInfo = [];
          const listProductLink = [];

          ulContent.find("li").each((index, liElement) => {
            // Sử dụng $(liElement) để tạo một đối tượng Cheerio từ phần tử li hiện tại
            const li = $(liElement);

            // Truy xuất vào thẻ tbody và lấy toàn bộ dữ liệu bên trong
            // Truy xuất vào thẻ tbody và lấy toàn bộ dữ liệu bên trong thẻ td
            const tdContents = li
              .find("tbody td")
              .map((tdIndex, tdElement) => $(tdElement).text())
              .get();

            // Truy xuất thông tin khác từ thẻ li
            const productName = li
              .find("h2.woocommerce-loop-product__title")
              .text();

            const productLink = li
              .find("a.woocommerce-LoopProduct-link")
              .attr("href");
            listProductLink.push(productLink);
            const productImageSrc = li.find("img").attr("src");

            // // Tạo đối tượng chứa thông tin sản phẩm
            // const productInfo = {
            //   name: productName,
            //   link: productLink,
            //   imageSrc: productImageSrc,
            //   tdContents: tdContents,
            // };

            // // Thêm đối tượng vào mảng
            // productsInfo.push(productInfo);

            // Ghi thông tin sản phẩm vào file txt
            // fs.writeFileSync("output.txt", "", "utf-8"); // Xóa nội dung cũ nếu có
            // productsInfo.forEach((product, index) => {
            //   fs.appendFileSync("output.txt", `Product ${index + 1}:\n`);
            //   fs.appendFileSync("output.txt", `Name: ${product.name}\n`);
            //   fs.appendFileSync("output.txt", `Link: ${product.link}\n`);
            //   fs.appendFileSync(
            //     "output.txt",
            //     `Image Src: ${product.imageSrc}\n`
            //   );
            //   fs.appendFileSync(
            //     "output.txt",
            //     `TD Contents: ${product.tdContents.join(", ")}\n`
            //   );
            //   fs.appendFileSync("output.txt", "-----------------------\n");
            // });

            console.log("Dữ liệu đã được lưu vào file output.txt");
          });

          // Ghi nội dung vào file txt
          // fs.writeFileSync("output.txt", ulContent, "utf-8");
          fs.writeFileSync(
            "list-product-link.txt",
            listProductLink.join("\n"),
            "utf-8"
          );

          console.log("Dữ liệu đã được lưu vào file output.txt");
        } else {
          console.log("Không thể tải trang web.");
        }
      })
      .catch((error) => {
        console.error("Đã có lỗi:", error);
      });
  }

  async crawlDataDetail(req, res) {
    const productsData = [];

    try {
      // Đọc dữ liệu từ file list-product-link
      const productLinks = fs
        .readFileSync("list-product-link.txt", "utf-8")
        .split("\n")
        .filter(Boolean);
      const productDetails = [];

      // Lặp qua từng URL trong danh sách
      for (const productLink of productLinks) {
        // Thực hiện yêu cầu HTTP để lấy nội dung trang web
        const response = await axios.get(productLink);

        // Kiểm tra xem yêu cầu có thành công không
        if (response.status === 200) {
          // Sử dụng Cheerio để phân tích cú pháp HTML
          const $ = cheerio.load(response.data);

          // Truy xuất vào thẻ có class "et_pb_module et_pb_text et_pb_text_3_tb_body productHeading et_pb_text_align_left et_pb_bg_layout_light"
          const fullName = $(
            ".et_pb_module.et_pb_text.et_pb_text_3_tb_body.productHeading.et_pb_text_align_left.et_pb_bg_layout_light div h2"
          ).text();

          const shortName = $(
            ".et_pb_module.et_pb_wc_title.et_pb_wc_title_0_tb_body.et_pb_bg_layout_light div h1"
          ).text();

          const textInner = $(
            ".et_pb_module.et_pb_text.et_pb_text_0_tb_body.et_pb_text_align_center.et_pb_bg_layout_light div"
          ).text();

          // Sử dụng hàm với tham số là class name
          const parameter = $(
            ".et_pb_module.et_pb_text.et_pb_text_4_tb_body.et_pb_text_align_left.et_pb_bg_layout_light div h3"
          ).text();

          const descriptionList = [];
          const descriptionElement = $(
            ".et_pb_module.et_pb_text.et_pb_text_5_tb_body.et_pb_text_align_left.et_pb_bg_layout_light"
          );

          // Kiểm tra xem phần tử có tồn tại không
          if (descriptionElement.length > 0) {
            // Truy xuất vào thẻ ul bên trong phần tử
            const ulElement = descriptionElement.find("ul");

            // Kiểm tra xem thẻ ul có tồn tại không
            if (ulElement.length > 0) {
              // Lặp qua từng thẻ li trong thẻ ul và lấy nội dung
              ulElement.find("li").each((index, liElement) => {
                // Sử dụng $(liElement) để tạo một đối tượng Cheerio từ phần tử li hiện tại
                const li = $(liElement);

                // Lấy nội dung của thẻ li và thêm vào mảng descriptionList
                descriptionList.push(li.text());
              });
            }
          }

          // Join nội dung của mảng descriptionList để tạo thành một chuỗi
          const description = descriptionList.join("\n");

          const productOverview = $(
            ".woocommerce.et-dynamic-content-woo.et-dynamic-content-woo--product_description"
          ).text();

          const dataArray = [];

          const dataRows = $(
            ".et_pb_toggle.et_pb_module.et_pb_accordion_item.et_pb_accordion_item_2_tb_body div table tbody tr"
          );
          // Lặp qua từng hàng trong tbody
          dataRows.each(function (index) {
            const rowData = [];

            // Lặp qua từng ô trong hàng
            $(this)
              .find("td")
              .each(function (tdIndex) {
                // Lấy nội dung từ thẻ <td>
                const value = $(this).text();

                // Thêm giá trị vào mảng rowData
                rowData.push(value);
              });

            // Thêm mảng rowData vào mảng 2D dataArray
            dataArray.push(rowData);
          });

          console.log(dataArray);

          const headerRow = [
            "SKU",
            "COAX_Cable_Type",
            "COAX_Cable_Length",
            "Color",
          ];
          const resultArray = [];
          const srcArray = [];

          if (dataArray[0]) {
            for (let i = 0; i < dataArray[0].length; i++) {
              const rowData = {};
              for (let j = 0; j < dataArray.length; j++) {
                const key = headerRow[j];
                const value = dataArray[j][i];
                rowData[key] = value;
              }
              resultArray.push(rowData);
            }
          }

          $(".woocommerce-product-gallery__wrapper [data-src]").each(
            function () {
              const dataSrc = $(this).attr("data-src");
              srcArray.push(dataSrc);
            }
          );

          const productInfo = {
            fullName: fullName,
            shortName: shortName,
            textInner: textInner,
            productLink: productLink,
            parameter: parameter,
            description: description,
            productOverview: productOverview,
            productOptions: resultArray,
            srcArray: srcArray,
            categories: [],
          };

          productsData.push(productInfo);
        } else {
          console.log(`Không thể truy cập URL: ${productLink}`);
        }
      }

      // Chuyển đổi mảng thành chuỗi JSON
      const jsonData = JSON.stringify(productsData, null, 2); // Tham số null và 2 để có định dạng và thụt lề đẹp

      // Ghi chuỗi JSON vào tệp
      fs.writeFileSync("output.json", jsonData, "utf-8");

      res.json(productDetails);
    } catch (error) {
      console.error("Đã có lỗi:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }

  async addCategories(req, res) {
    const { url, categoriesName } = req.body;
    // Đọc dữ liệu từ file output.json
    let outputData = [];
    fs.readFile("output.json", "utf8", (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      // Parse dữ liệu từ chuỗi JSON
      outputData = JSON.parse(data);

      // Sử dụng Axios để tải nội dung của trang web
      axios
        .get(url)
        .then((response) => {
          // Kiểm tra xem trang web có được tải thành công không
          if (response.status === 200) {
            // Sử dụng Cheerio để phân tích cú pháp HTML
            const $ = cheerio.load(response.data);

            // Truy xuất vào thẻ ul và lấy toàn bộ nội dung
            const ulContent = $("ul.products.columns-4");

            ulContent.find("li").each((index, liElement) => {
              // Sử dụng $(liElement) để tạo một đối tượng Cheerio từ phần tử li hiện tại
              const li = $(liElement);
              // Truy xuất thông tin khác từ thẻ li
              const productName = li
                .find("h2.woocommerce-loop-product__title")
                .text();

              console.log(`Ten san pham thu ${index} `, productName);
              // Lặp qua từng sản phẩm trong mảng outputData
              outputData.forEach((product) => {
                if (product.shortName == productName) {
                  product.categories.push(categoriesName);
                }
              });
            });

            fs.writeFile(
              "output.json",
              JSON.stringify(outputData, null, 2),
              "utf8",
              (err) => {
                if (err) {
                  console.error("Error writing file:", err);
                } else {
                  console.log("Categories added to output.json successfully.");
                }
              }
            );
          } else {
            console.log("Không thể tải trang web.");
          }
        })
        .catch((error) => {
          console.error("Đã có lỗi:", error);
        });
    });
  }

  async downloadImg() {
    fs.readFile("output.json", "utf8", async (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      // Parse dữ liệu từ chuỗi JSON
      const outputData = JSON.parse(data);

      for (const item of outputData) {
        const folderName = item.shortName;

        // Tạo thư mục nếu chưa tồn tại
        if (!fs.existsSync(folderName)) {
          fs.mkdirSync(folderName);
        }

        for (let i = 0; i < item.srcArray.length; i++) {
          const imageUrl = item.srcArray[i];
          const imageFileName = `image${i + 1}.png`;

          // Tạo đường dẫn đầy đủ cho hình ảnh trong thư mục
          const imagePath = path.join(folderName, imageFileName);

          try {
            const response = await axios({
              url: imageUrl,
              method: "GET",
              responseType: "stream",
            });

            response.data.pipe(fs.createWriteStream(imagePath));
          } catch (error) {
            console.error(`Error downloading image: ${imageUrl}`);
          }
        }
      }
    });
  }

  async convertJsonToCsv(req, res) {
    fs.readFile("output.json", "utf8", async (err, data) => {
      if (err) {
        console.error("Error reading file:", err);
        return;
      }

      // Parse dữ liệu từ chuỗi JSON
      const outputData = JSON.parse(data);
      const csvRows = [];

      for (const item of outputData) {
        const skuValues = item.productOptions.map((option) => option.SKU);
        const csvRow = {
          ID: item.shortName,
          Type: "simple",
          SKU: skuValues.join(", "),
          Name: item.fullName,
          Published: 1,
          "Is featured": 0,
          "Visibility in catalog": "visible",
          "Short description": item.description,
          Description: item.productOverview,
          "Date sale price starts": "",
          "Date sale price ends": "",
          "Tax status": "taxable",
          "Tax class": "",
          "In stock?": 1,
          Stock: "",
          "Low stock amount": "",
          "Backorders allowed?": 0,
          "Sold individually?": 0,
          "Weight (kg)": "",
          "Length (cm)": "",
          "Width (cm)": "",
          "Height (cm)": "",
          "Allow customer reviews?": 1,
          "Purchase note": "",
          "Sale price": "",
          "Regular price": "",
          Categories: item.categories.join(", "),
          Tags: item.categories.join(", "),
          "Shipping class": "",
          Images: `http://localhost:8080/wordpress/wp-content/uploads/productImg/${item.shortName}/image1.png`,
          "Download limit": "",
          "Download expiry days": "",
          Parent: "",
          "Grouped products": "",
          Upsells: "",
          "Cross-sells": "",
          "External URL": "",
          "Button text": "",
          Position: 0,
        };

        csvRows.push(csvRow);
      }

      // Convert the array of rows to a CSV string
      const csvString = await convertRowsToCsv(csvRows);

      // Write the CSV string to a file
      await writeFile("output.csv", csvString, "utf8");

      // Respond with success or send the CSV file in the response
      res.status(200).send("CSV conversion successful");
    });
    // Helper function to convert an array of rows to CSV string
    function convertRowsToCsv(rows) {
      return new Promise((resolve) => {
        const csvRows = rows.map((row) =>
          Object.values(row)
            .map((value) => `"${value}"`)
            .join(",")
        );
        const csvString = csvRows.join("\n");
        resolve(csvString);
      });
    }
  }

  async handleData(req, res) {
    try {
      // Đọc dữ liệu từ file list_name.txt
      const productList = fs
        .readFileSync("list_name.txt", "utf-8")
        .split("\n")
        .map((name) => name.trim());

      // Đọc dữ liệu từ file output.json
      const jsonData = fs.readFileSync("output.json", "utf-8");
      const outputData = JSON.parse(jsonData);

      // Duyệt qua mảng chứa các object
      for (const item of outputData) {
        // Kiểm tra xem shortName có trong danh sách không
        if (productList.includes(item.shortName)) {
          // Nếu có, lấy thông tin textInner và ghi vào file
          const textInner = item.textInner;
          const textParametor = item.parameter;

          let SKU = "";
          let COAX_Cable_Length = "";
          let COAX_Cable_Type = "";
          let Color = "";
          if (item.productOptions.length > 0) {
            SKU = item.productOptions[0].SKU;
            COAX_Cable_Type = item.productOptions[0].COAX_Cable_Type;
            COAX_Cable_Length = item.productOptions[0].COAX_Cable_Length;
            Color = item.productOptions[0].Color;
          }
          fs.appendFileSync("output_textInner.txt", `${textInner}\n`);
          fs.appendFileSync("output_parameter.txt", `${textParametor}\n`);
          fs.appendFileSync("output_SKU.txt", `${SKU}\n`);
          fs.appendFileSync(           
            "output_COAX_Cable_Type.txt",
            `${COAX_Cable_Type}\n`
          );
          fs.appendFileSync(
            "output_COAX_Cable_Length.txt",
            `${COAX_Cable_Length}\n`
          );
          fs.appendFileSync("output_Color.txt", `${Color}\n`);
        }
      }

      res.status(200).send("Xử lý thành công!");
    } catch (error) {
      console.error("Lỗi xử lý:", error);
      res.status(500).send("Có lỗi xảy ra trong quá trình xử lý.");
    }
  }
}

module.exports = new crawl();
